(function(){
'use strict';
/* Scala.js runtime support
 * Copyright 2013 LAMP/EPFL
 * Author: Sébastien Doeraene
 */

/* ---------------------------------- *
 * The top-level Scala.js environment *
 * ---------------------------------- */





// Get the environment info
var $env = (typeof __ScalaJSEnv === "object" && __ScalaJSEnv) ? __ScalaJSEnv : {};

// Global scope
var $g =
  (typeof $env["global"] === "object" && $env["global"])
    ? $env["global"]
    : ((typeof global === "object" && global && global["Object"] === Object) ? global : this);
$env["global"] = $g;

// Where to send exports



var $e =
  (typeof $env["exportsNamespace"] === "object" && $env["exportsNamespace"])
    ? $env["exportsNamespace"] : $g;

$env["exportsNamespace"] = $e;

// Freeze the environment info
$g["Object"]["freeze"]($env);

// Linking info - must be in sync with scala.scalajs.runtime.LinkingInfo
var $linkingInfo = {
  "envInfo": $env,
  "semantics": {




    "asInstanceOfs": 1,








    "arrayIndexOutOfBounds": 1,










    "moduleInit": 2,





    "strictFloats": false,




    "productionMode": false

  },



  "assumingES6": false,

  "linkerVersion": "0.6.15"
};
$g["Object"]["freeze"]($linkingInfo);
$g["Object"]["freeze"]($linkingInfo["semantics"]);

// Snapshots of builtins and polyfills






var $imul = $g["Math"]["imul"] || (function(a, b) {
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
  var ah = (a >>> 16) & 0xffff;
  var al = a & 0xffff;
  var bh = (b >>> 16) & 0xffff;
  var bl = b & 0xffff;
  // the shift by 0 fixes the sign on the high part
  // the final |0 converts the unsigned value into a signed value
  return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
});

var $fround = $g["Math"]["fround"] ||









  (function(v) {
    return +v;
  });


var $clz32 = $g["Math"]["clz32"] || (function(i) {
  // See Hacker's Delight, Section 5-3
  if (i === 0) return 32;
  var r = 1;
  if ((i & 0xffff0000) === 0) { i <<= 16; r += 16; };
  if ((i & 0xff000000) === 0) { i <<= 8; r += 8; };
  if ((i & 0xf0000000) === 0) { i <<= 4; r += 4; };
  if ((i & 0xc0000000) === 0) { i <<= 2; r += 2; };
  return r + (i >> 31);
});


// Other fields




















var $lastIDHash = 0; // last value attributed to an id hash code



var $idHashCodeMap = $g["WeakMap"] ? new $g["WeakMap"]() : null;



// Core mechanism

var $makeIsArrayOfPrimitive = function(primitiveData) {
  return function(obj, depth) {
    return !!(obj && obj.$classData &&
      (obj.$classData.arrayDepth === depth) &&
      (obj.$classData.arrayBase === primitiveData));
  }
};


var $makeAsArrayOfPrimitive = function(isInstanceOfFunction, arrayEncodedName) {
  return function(obj, depth) {
    if (isInstanceOfFunction(obj, depth) || (obj === null))
      return obj;
    else
      $throwArrayCastException(obj, arrayEncodedName, depth);
  }
};


/** Encode a property name for runtime manipulation
  *  Usage:
  *    env.propertyName({someProp:0})
  *  Returns:
  *    "someProp"
  *  Useful when the property is renamed by a global optimizer (like Closure)
  *  but we must still get hold of a string of that name for runtime
  * reflection.
  */
var $propertyName = function(obj) {
  for (var prop in obj)
    return prop;
};

// Runtime functions

var $isScalaJSObject = function(obj) {
  return !!(obj && obj.$classData);
};


var $throwClassCastException = function(instance, classFullName) {




  throw new $c_sjsr_UndefinedBehaviorError().init___jl_Throwable(
    new $c_jl_ClassCastException().init___T(
      instance + " is not an instance of " + classFullName));

};

var $throwArrayCastException = function(instance, classArrayEncodedName, depth) {
  for (; depth; --depth)
    classArrayEncodedName = "[" + classArrayEncodedName;
  $throwClassCastException(instance, classArrayEncodedName);
};



var $throwArrayIndexOutOfBoundsException = function(i) {
  var msg = (i === null) ? null : ("" + i);



  throw new $c_sjsr_UndefinedBehaviorError().init___jl_Throwable(
    new $c_jl_ArrayIndexOutOfBoundsException().init___T(msg));

};


var $noIsInstance = function(instance) {
  throw new $g["TypeError"](
    "Cannot call isInstance() on a Class representing a raw JS trait/object");
};

var $makeNativeArrayWrapper = function(arrayClassData, nativeArray) {
  return new arrayClassData.constr(nativeArray);
};

var $newArrayObject = function(arrayClassData, lengths) {
  return $newArrayObjectInternal(arrayClassData, lengths, 0);
};

var $newArrayObjectInternal = function(arrayClassData, lengths, lengthIndex) {
  var result = new arrayClassData.constr(lengths[lengthIndex]);

  if (lengthIndex < lengths.length-1) {
    var subArrayClassData = arrayClassData.componentData;
    var subLengthIndex = lengthIndex+1;
    var underlying = result.u;
    for (var i = 0; i < underlying.length; i++) {
      underlying[i] = $newArrayObjectInternal(
        subArrayClassData, lengths, subLengthIndex);
    }
  }

  return result;
};

var $objectToString = function(instance) {
  if (instance === void 0)
    return "undefined";
  else
    return instance.toString();
};

var $objectGetClass = function(instance) {
  switch (typeof instance) {
    case "string":
      return $d_T.getClassOf();
    case "number": {
      var v = instance | 0;
      if (v === instance) { // is the value integral?
        if ($isByte(v))
          return $d_jl_Byte.getClassOf();
        else if ($isShort(v))
          return $d_jl_Short.getClassOf();
        else
          return $d_jl_Integer.getClassOf();
      } else {
        if ($isFloat(instance))
          return $d_jl_Float.getClassOf();
        else
          return $d_jl_Double.getClassOf();
      }
    }
    case "boolean":
      return $d_jl_Boolean.getClassOf();
    case "undefined":
      return $d_sr_BoxedUnit.getClassOf();
    default:
      if (instance === null)
        return instance.getClass__jl_Class();
      else if ($is_sjsr_RuntimeLong(instance))
        return $d_jl_Long.getClassOf();
      else if ($isScalaJSObject(instance))
        return instance.$classData.getClassOf();
      else
        return null; // Exception?
  }
};

var $objectClone = function(instance) {
  if ($isScalaJSObject(instance) || (instance === null))
    return instance.clone__O();
  else
    throw new $c_jl_CloneNotSupportedException().init___();
};

var $objectNotify = function(instance) {
  // final and no-op in java.lang.Object
  if (instance === null)
    instance.notify__V();
};

var $objectNotifyAll = function(instance) {
  // final and no-op in java.lang.Object
  if (instance === null)
    instance.notifyAll__V();
};

var $objectFinalize = function(instance) {
  if ($isScalaJSObject(instance) || (instance === null))
    instance.finalize__V();
  // else no-op
};

var $objectEquals = function(instance, rhs) {
  if ($isScalaJSObject(instance) || (instance === null))
    return instance.equals__O__Z(rhs);
  else if (typeof instance === "number")
    return typeof rhs === "number" && $numberEquals(instance, rhs);
  else
    return instance === rhs;
};

var $numberEquals = function(lhs, rhs) {
  return (lhs === rhs) ? (
    // 0.0.equals(-0.0) must be false
    lhs !== 0 || 1/lhs === 1/rhs
  ) : (
    // are they both NaN?
    (lhs !== lhs) && (rhs !== rhs)
  );
};

var $objectHashCode = function(instance) {
  switch (typeof instance) {
    case "string":
      return $m_sjsr_RuntimeString$().hashCode__T__I(instance);
    case "number":
      return $m_sjsr_Bits$().numberHashCode__D__I(instance);
    case "boolean":
      return instance ? 1231 : 1237;
    case "undefined":
      return 0;
    default:
      if ($isScalaJSObject(instance) || instance === null)
        return instance.hashCode__I();

      else if ($idHashCodeMap === null)
        return 42;

      else
        return $systemIdentityHashCode(instance);
  }
};

var $comparableCompareTo = function(instance, rhs) {
  switch (typeof instance) {
    case "string":

      $as_T(rhs);

      return instance === rhs ? 0 : (instance < rhs ? -1 : 1);
    case "number":

      $as_jl_Number(rhs);

      return $m_jl_Double$().compare__D__D__I(instance, rhs);
    case "boolean":

      $asBoolean(rhs);

      return instance - rhs; // yes, this gives the right result
    default:
      return instance.compareTo__O__I(rhs);
  }
};

var $charSequenceLength = function(instance) {
  if (typeof(instance) === "string")

    return $uI(instance["length"]);



  else
    return instance.length__I();
};

var $charSequenceCharAt = function(instance, index) {
  if (typeof(instance) === "string")

    return $uI(instance["charCodeAt"](index)) & 0xffff;



  else
    return instance.charAt__I__C(index);
};

var $charSequenceSubSequence = function(instance, start, end) {
  if (typeof(instance) === "string")

    return $as_T(instance["substring"](start, end));



  else
    return instance.subSequence__I__I__jl_CharSequence(start, end);
};

var $booleanBooleanValue = function(instance) {
  if (typeof instance === "boolean") return instance;
  else                               return instance.booleanValue__Z();
};

var $numberByteValue = function(instance) {
  if (typeof instance === "number") return (instance << 24) >> 24;
  else                              return instance.byteValue__B();
};
var $numberShortValue = function(instance) {
  if (typeof instance === "number") return (instance << 16) >> 16;
  else                              return instance.shortValue__S();
};
var $numberIntValue = function(instance) {
  if (typeof instance === "number") return instance | 0;
  else                              return instance.intValue__I();
};
var $numberLongValue = function(instance) {
  if (typeof instance === "number")
    return $m_sjsr_RuntimeLong$().fromDouble__D__sjsr_RuntimeLong(instance);
  else
    return instance.longValue__J();
};
var $numberFloatValue = function(instance) {
  if (typeof instance === "number") return $fround(instance);
  else                              return instance.floatValue__F();
};
var $numberDoubleValue = function(instance) {
  if (typeof instance === "number") return instance;
  else                              return instance.doubleValue__D();
};

var $isNaN = function(instance) {
  return instance !== instance;
};

var $isInfinite = function(instance) {
  return !$g["isFinite"](instance) && !$isNaN(instance);
};

var $doubleToInt = function(x) {
  return (x > 2147483647) ? (2147483647) : ((x < -2147483648) ? -2147483648 : (x | 0));
};

/** Instantiates a JS object with variadic arguments to the constructor. */
var $newJSObjectWithVarargs = function(ctor, args) {
  // This basically emulates the ECMAScript specification for 'new'.
  var instance = $g["Object"]["create"](ctor.prototype);
  var result = ctor["apply"](instance, args);
  switch (typeof result) {
    case "string": case "number": case "boolean": case "undefined": case "symbol":
      return instance;
    default:
      return result === null ? instance : result;
  }
};

var $resolveSuperRef = function(initialProto, propName) {
  var getPrototypeOf = $g["Object"]["getPrototypeOf"];
  var getOwnPropertyDescriptor = $g["Object"]["getOwnPropertyDescriptor"];

  var superProto = getPrototypeOf(initialProto);
  while (superProto !== null) {
    var desc = getOwnPropertyDescriptor(superProto, propName);
    if (desc !== void 0)
      return desc;
    superProto = getPrototypeOf(superProto);
  }

  return void 0;
};

var $superGet = function(initialProto, self, propName) {
  var desc = $resolveSuperRef(initialProto, propName);
  if (desc !== void 0) {
    var getter = desc["get"];
    if (getter !== void 0)
      return getter["call"](self);
    else
      return desc["value"];
  }
  return void 0;
};

var $superSet = function(initialProto, self, propName, value) {
  var desc = $resolveSuperRef(initialProto, propName);
  if (desc !== void 0) {
    var setter = desc["set"];
    if (setter !== void 0) {
      setter["call"](self, value);
      return void 0;
    }
  }
  throw new $g["TypeError"]("super has no setter '" + propName + "'.");
};







var $propertiesOf = function(obj) {
  var result = [];
  for (var prop in obj)
    result["push"](prop);
  return result;
};

var $systemArraycopy = function(src, srcPos, dest, destPos, length) {
  var srcu = src.u;
  var destu = dest.u;


  if (srcPos < 0 || destPos < 0 || length < 0 ||
      (srcPos > ((srcu.length - length) | 0)) ||
      (destPos > ((destu.length - length) | 0))) {
    $throwArrayIndexOutOfBoundsException(null);
  }


  if (srcu !== destu || destPos < srcPos || (((srcPos + length) | 0) < destPos)) {
    for (var i = 0; i < length; i = (i + 1) | 0)
      destu[(destPos + i) | 0] = srcu[(srcPos + i) | 0];
  } else {
    for (var i = (length - 1) | 0; i >= 0; i = (i - 1) | 0)
      destu[(destPos + i) | 0] = srcu[(srcPos + i) | 0];
  }
};

var $systemIdentityHashCode =

  ($idHashCodeMap !== null) ?

  (function(obj) {
    switch (typeof obj) {
      case "string": case "number": case "boolean": case "undefined":
        return $objectHashCode(obj);
      default:
        if (obj === null) {
          return 0;
        } else {
          var hash = $idHashCodeMap["get"](obj);
          if (hash === void 0) {
            hash = ($lastIDHash + 1) | 0;
            $lastIDHash = hash;
            $idHashCodeMap["set"](obj, hash);
          }
          return hash;
        }
    }

  }) :
  (function(obj) {
    if ($isScalaJSObject(obj)) {
      var hash = obj["$idHashCode$0"];
      if (hash !== void 0) {
        return hash;
      } else if (!$g["Object"]["isSealed"](obj)) {
        hash = ($lastIDHash + 1) | 0;
        $lastIDHash = hash;
        obj["$idHashCode$0"] = hash;
        return hash;
      } else {
        return 42;
      }
    } else if (obj === null) {
      return 0;
    } else {
      return $objectHashCode(obj);
    }

  });

// is/as for hijacked boxed classes (the non-trivial ones)

var $isByte = function(v) {
  return (v << 24 >> 24) === v && 1/v !== 1/-0;
};

var $isShort = function(v) {
  return (v << 16 >> 16) === v && 1/v !== 1/-0;
};

var $isInt = function(v) {
  return (v | 0) === v && 1/v !== 1/-0;
};

var $isFloat = function(v) {



  return typeof v === "number";

};


var $asUnit = function(v) {
  if (v === void 0 || v === null)
    return v;
  else
    $throwClassCastException(v, "scala.runtime.BoxedUnit");
};

var $asBoolean = function(v) {
  if (typeof v === "boolean" || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Boolean");
};

var $asByte = function(v) {
  if ($isByte(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Byte");
};

var $asShort = function(v) {
  if ($isShort(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Short");
};

var $asInt = function(v) {
  if ($isInt(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Integer");
};

var $asFloat = function(v) {
  if ($isFloat(v) || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Float");
};

var $asDouble = function(v) {
  if (typeof v === "number" || v === null)
    return v;
  else
    $throwClassCastException(v, "java.lang.Double");
};


// Unboxes


var $uZ = function(value) {
  return !!$asBoolean(value);
};
var $uB = function(value) {
  return $asByte(value) | 0;
};
var $uS = function(value) {
  return $asShort(value) | 0;
};
var $uI = function(value) {
  return $asInt(value) | 0;
};
var $uJ = function(value) {
  return null === value ? $m_sjsr_RuntimeLong$().Zero$1
                        : $as_sjsr_RuntimeLong(value);
};
var $uF = function(value) {
  /* Here, it is fine to use + instead of fround, because asFloat already
   * ensures that the result is either null or a float.
   */
  return +$asFloat(value);
};
var $uD = function(value) {
  return +$asDouble(value);
};






// TypeArray conversions

var $byteArray2TypedArray = function(value) { return new $g["Int8Array"](value.u); };
var $shortArray2TypedArray = function(value) { return new $g["Int16Array"](value.u); };
var $charArray2TypedArray = function(value) { return new $g["Uint16Array"](value.u); };
var $intArray2TypedArray = function(value) { return new $g["Int32Array"](value.u); };
var $floatArray2TypedArray = function(value) { return new $g["Float32Array"](value.u); };
var $doubleArray2TypedArray = function(value) { return new $g["Float64Array"](value.u); };

var $typedArray2ByteArray = function(value) {
  var arrayClassData = $d_B.getArrayOf();
  return new arrayClassData.constr(new $g["Int8Array"](value));
};
var $typedArray2ShortArray = function(value) {
  var arrayClassData = $d_S.getArrayOf();
  return new arrayClassData.constr(new $g["Int16Array"](value));
};
var $typedArray2CharArray = function(value) {
  var arrayClassData = $d_C.getArrayOf();
  return new arrayClassData.constr(new $g["Uint16Array"](value));
};
var $typedArray2IntArray = function(value) {
  var arrayClassData = $d_I.getArrayOf();
  return new arrayClassData.constr(new $g["Int32Array"](value));
};
var $typedArray2FloatArray = function(value) {
  var arrayClassData = $d_F.getArrayOf();
  return new arrayClassData.constr(new $g["Float32Array"](value));
};
var $typedArray2DoubleArray = function(value) {
  var arrayClassData = $d_D.getArrayOf();
  return new arrayClassData.constr(new $g["Float64Array"](value));
};

// TypeData class


/** @constructor */
var $TypeData = function() {




  // Runtime support
  this.constr = void 0;
  this.parentData = void 0;
  this.ancestors = null;
  this.componentData = null;
  this.arrayBase = null;
  this.arrayDepth = 0;
  this.zero = null;
  this.arrayEncodedName = "";
  this._classOf = void 0;
  this._arrayOf = void 0;
  this.isArrayOf = void 0;

  // java.lang.Class support
  this["name"] = "";
  this["isPrimitive"] = false;
  this["isInterface"] = false;
  this["isArrayClass"] = false;
  this["isRawJSType"] = false;
  this["isInstance"] = void 0;
};


$TypeData.prototype.initPrim = function(



    zero, arrayEncodedName, displayName) {
  // Runtime support
  this.ancestors = {};
  this.componentData = null;
  this.zero = zero;
  this.arrayEncodedName = arrayEncodedName;
  this.isArrayOf = function(obj, depth) { return false; };

  // java.lang.Class support
  this["name"] = displayName;
  this["isPrimitive"] = true;
  this["isInstance"] = function(obj) { return false; };

  return this;
};


$TypeData.prototype.initClass = function(



    internalNameObj, isInterface, fullName,
    ancestors, isRawJSType, parentData, isInstance, isArrayOf) {
  var internalName = $propertyName(internalNameObj);

  isInstance = isInstance || function(obj) {
    return !!(obj && obj.$classData && obj.$classData.ancestors[internalName]);
  };

  isArrayOf = isArrayOf || function(obj, depth) {
    return !!(obj && obj.$classData && (obj.$classData.arrayDepth === depth)
      && obj.$classData.arrayBase.ancestors[internalName])
  };

  // Runtime support
  this.parentData = parentData;
  this.ancestors = ancestors;
  this.arrayEncodedName = "L"+fullName+";";
  this.isArrayOf = isArrayOf;

  // java.lang.Class support
  this["name"] = fullName;
  this["isInterface"] = isInterface;
  this["isRawJSType"] = !!isRawJSType;
  this["isInstance"] = isInstance;

  return this;
};


$TypeData.prototype.initArray = function(



    componentData) {
  // The constructor

  var componentZero0 = componentData.zero;

  // The zero for the Long runtime representation
  // is a special case here, since the class has not
  // been defined yet, when this file is read
  var componentZero = (componentZero0 == "longZero")
    ? $m_sjsr_RuntimeLong$().Zero$1
    : componentZero0;


  /** @constructor */
  var ArrayClass = function(arg) {
    if (typeof(arg) === "number") {
      // arg is the length of the array
      this.u = new Array(arg);
      for (var i = 0; i < arg; i++)
        this.u[i] = componentZero;
    } else {
      // arg is a native array that we wrap
      this.u = arg;
    }
  }
  ArrayClass.prototype = new $h_O;
  ArrayClass.prototype.constructor = ArrayClass;


  ArrayClass.prototype.get = function(i) {
    if (i < 0 || i >= this.u.length)
      $throwArrayIndexOutOfBoundsException(i);
    return this.u[i];
  };
  ArrayClass.prototype.set = function(i, v) {
    if (i < 0 || i >= this.u.length)
      $throwArrayIndexOutOfBoundsException(i);
    this.u[i] = v;
  };


  ArrayClass.prototype.clone__O = function() {
    if (this.u instanceof Array)
      return new ArrayClass(this.u["slice"](0));
    else
      // The underlying Array is a TypedArray
      return new ArrayClass(new this.u.constructor(this.u));
  };






































  ArrayClass.prototype.$classData = this;

  // Don't generate reflective call proxies. The compiler special cases
  // reflective calls to methods on scala.Array

  // The data

  var encodedName = "[" + componentData.arrayEncodedName;
  var componentBase = componentData.arrayBase || componentData;
  var arrayDepth = componentData.arrayDepth + 1;

  var isInstance = function(obj) {
    return componentBase.isArrayOf(obj, arrayDepth);
  }

  // Runtime support
  this.constr = ArrayClass;
  this.parentData = $d_O;
  this.ancestors = {O: 1, jl_Cloneable: 1, Ljava_io_Serializable: 1};
  this.componentData = componentData;
  this.arrayBase = componentBase;
  this.arrayDepth = arrayDepth;
  this.zero = null;
  this.arrayEncodedName = encodedName;
  this._classOf = undefined;
  this._arrayOf = undefined;
  this.isArrayOf = undefined;

  // java.lang.Class support
  this["name"] = encodedName;
  this["isPrimitive"] = false;
  this["isInterface"] = false;
  this["isArrayClass"] = true;
  this["isInstance"] = isInstance;

  return this;
};


$TypeData.prototype.getClassOf = function() {



  if (!this._classOf)
    this._classOf = new $c_jl_Class().init___jl_ScalaJSClassData(this);
  return this._classOf;
};


$TypeData.prototype.getArrayOf = function() {



  if (!this._arrayOf)
    this._arrayOf = new $TypeData().initArray(this);
  return this._arrayOf;
};

// java.lang.Class support


$TypeData.prototype["getFakeInstance"] = function() {



  if (this === $d_T)
    return "some string";
  else if (this === $d_jl_Boolean)
    return false;
  else if (this === $d_jl_Byte ||
           this === $d_jl_Short ||
           this === $d_jl_Integer ||
           this === $d_jl_Float ||
           this === $d_jl_Double)
    return 0;
  else if (this === $d_jl_Long)
    return $m_sjsr_RuntimeLong$().Zero$1;
  else if (this === $d_sr_BoxedUnit)
    return void 0;
  else
    return {$classData: this};
};


$TypeData.prototype["getSuperclass"] = function() {



  return this.parentData ? this.parentData.getClassOf() : null;
};


$TypeData.prototype["getComponentType"] = function() {



  return this.componentData ? this.componentData.getClassOf() : null;
};


$TypeData.prototype["newArrayOfThisClass"] = function(lengths) {



  var arrayClassData = this;
  for (var i = 0; i < lengths.length; i++)
    arrayClassData = arrayClassData.getArrayOf();
  return $newArrayObject(arrayClassData, lengths);
};




// Create primitive types

var $d_V = new $TypeData().initPrim(undefined, "V", "void");
var $d_Z = new $TypeData().initPrim(false, "Z", "boolean");
var $d_C = new $TypeData().initPrim(0, "C", "char");
var $d_B = new $TypeData().initPrim(0, "B", "byte");
var $d_S = new $TypeData().initPrim(0, "S", "short");
var $d_I = new $TypeData().initPrim(0, "I", "int");
var $d_J = new $TypeData().initPrim("longZero", "J", "long");
var $d_F = new $TypeData().initPrim(0.0, "F", "float");
var $d_D = new $TypeData().initPrim(0.0, "D", "double");

// Instance tests for array of primitives

var $isArrayOf_Z = $makeIsArrayOfPrimitive($d_Z);
$d_Z.isArrayOf = $isArrayOf_Z;

var $isArrayOf_C = $makeIsArrayOfPrimitive($d_C);
$d_C.isArrayOf = $isArrayOf_C;

var $isArrayOf_B = $makeIsArrayOfPrimitive($d_B);
$d_B.isArrayOf = $isArrayOf_B;

var $isArrayOf_S = $makeIsArrayOfPrimitive($d_S);
$d_S.isArrayOf = $isArrayOf_S;

var $isArrayOf_I = $makeIsArrayOfPrimitive($d_I);
$d_I.isArrayOf = $isArrayOf_I;

var $isArrayOf_J = $makeIsArrayOfPrimitive($d_J);
$d_J.isArrayOf = $isArrayOf_J;

var $isArrayOf_F = $makeIsArrayOfPrimitive($d_F);
$d_F.isArrayOf = $isArrayOf_F;

var $isArrayOf_D = $makeIsArrayOfPrimitive($d_D);
$d_D.isArrayOf = $isArrayOf_D;


// asInstanceOfs for array of primitives
var $asArrayOf_Z = $makeAsArrayOfPrimitive($isArrayOf_Z, "Z");
var $asArrayOf_C = $makeAsArrayOfPrimitive($isArrayOf_C, "C");
var $asArrayOf_B = $makeAsArrayOfPrimitive($isArrayOf_B, "B");
var $asArrayOf_S = $makeAsArrayOfPrimitive($isArrayOf_S, "S");
var $asArrayOf_I = $makeAsArrayOfPrimitive($isArrayOf_I, "I");
var $asArrayOf_J = $makeAsArrayOfPrimitive($isArrayOf_J, "J");
var $asArrayOf_F = $makeAsArrayOfPrimitive($isArrayOf_F, "F");
var $asArrayOf_D = $makeAsArrayOfPrimitive($isArrayOf_D, "D");

function $is_F0(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.F0)))
}
function $as_F0(obj) {
  return (($is_F0(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Function0"))
}
function $isArrayOf_F0(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.F0)))
}
function $asArrayOf_F0(obj, depth) {
  return (($isArrayOf_F0(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Function0;", depth))
}
function $f_F1__compose__F1__F1($thiz, g) {
  return new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, g$1) {
    return (function(x$2) {
      return $this.apply__O__O(g$1.apply__O__O(x$2))
    })
  })($thiz, g))
}
function $f_F1__andThen__F1__F1($thiz, g) {
  return new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, g$1) {
    return (function(x$2) {
      return g$1.apply__O__O($this.apply__O__O(x$2))
    })
  })($thiz, g))
}
function $is_F1(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.F1)))
}
function $as_F1(obj) {
  return (($is_F1(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Function1"))
}
function $isArrayOf_F1(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.F1)))
}
function $asArrayOf_F1(obj, depth) {
  return (($isArrayOf_F1(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Function1;", depth))
}
function $f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__mountedPure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot($thiz) {
  return $as_Ljapgolly_scalajs_react_component_Scala$MountedWithRoot($thiz.raw__Ljapgolly_scalajs_react_raw_package$ReactComponent().mountedPure)
}
function $f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot($thiz) {
  return $as_Ljapgolly_scalajs_react_component_Scala$MountedWithRoot($thiz.raw__Ljapgolly_scalajs_react_raw_package$ReactComponent().mountedImpure)
}
function $f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__backend__O($thiz) {
  return $thiz.raw__Ljapgolly_scalajs_react_raw_package$ReactComponent().backend
}
function $is_Ljapgolly_scalajs_react_extra_Listenable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_extra_Listenable)))
}
function $as_Ljapgolly_scalajs_react_extra_Listenable(obj) {
  return (($is_Ljapgolly_scalajs_react_extra_Listenable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.extra.Listenable"))
}
function $isArrayOf_Ljapgolly_scalajs_react_extra_Listenable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_extra_Listenable)))
}
function $asArrayOf_Ljapgolly_scalajs_react_extra_Listenable(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_extra_Listenable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.extra.Listenable;", depth))
}
function $f_Ljapgolly_scalajs_react_extra_OnUnmount__unmount__F0($thiz) {
  return $m_Ljapgolly_scalajs_react_Callback$().apply__F0__Ljapgolly_scalajs_react_Callback$ResultGuard__F0(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
    return (function() {
      var this$1 = $this.japgolly$scalajs$react$extra$OnUnmount$$unmountProcs$1;
      var these = this$1;
      while ((!these.isEmpty__Z())) {
        var arg1 = these.head__O();
        var x$1 = $as_Ljapgolly_scalajs_react_CallbackTo(arg1).japgolly$scalajs$react$CallbackTo$$f$1;
        x$1.apply__O();
        var this$3 = these;
        these = this$3.tail__sci_List()
      };
      $this.japgolly$scalajs$react$extra$OnUnmount$$unmountProcs$1 = $m_sci_Nil$()
    })
  })($thiz)), null)
}
function $f_Ljapgolly_scalajs_react_extra_OnUnmount__onUnmount__F0__F0($thiz, f) {
  return $m_Ljapgolly_scalajs_react_Callback$().apply__F0__Ljapgolly_scalajs_react_Callback$ResultGuard__F0(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, f$1) {
    return (function() {
      var this$1 = $this.japgolly$scalajs$react$extra$OnUnmount$$unmountProcs$1;
      var x = new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0(f$1);
      $this.japgolly$scalajs$react$extra$OnUnmount$$unmountProcs$1 = new $c_sci_$colon$colon().init___O__sci_List(x, this$1)
    })
  })($thiz, f)), null)
}
function $is_Ljapgolly_scalajs_react_extra_OnUnmount(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_extra_OnUnmount)))
}
function $as_Ljapgolly_scalajs_react_extra_OnUnmount(obj) {
  return (($is_Ljapgolly_scalajs_react_extra_OnUnmount(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.extra.OnUnmount"))
}
function $isArrayOf_Ljapgolly_scalajs_react_extra_OnUnmount(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_extra_OnUnmount)))
}
function $asArrayOf_Ljapgolly_scalajs_react_extra_OnUnmount(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_extra_OnUnmount(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.extra.OnUnmount;", depth))
}
function $f_Ljapgolly_scalajs_react_vdom_HtmlAttrs__$$init$__V($thiz) {
  $thiz.japgolly$scalajs$react$vdom$HtmlAttrs$$undsetter$und$key$und$eq__Ljapgolly_scalajs_react_vdom_Attr__V($m_Ljapgolly_scalajs_react_vdom_PackageBase$().VdomAttr$1.Key$1);
  $thiz.japgolly$scalajs$react$vdom$HtmlAttrs$$undsetter$und$onChange$und$eq__Ljapgolly_scalajs_react_vdom_Attr$Event__V(new $c_Ljapgolly_scalajs_react_vdom_Attr$Event().init___T("onChange"));
  $thiz.japgolly$scalajs$react$vdom$HtmlAttrs$$undsetter$und$onClick$und$eq__Ljapgolly_scalajs_react_vdom_Attr$Event__V(new $c_Ljapgolly_scalajs_react_vdom_Attr$Event().init___T("onClick"));
  $thiz.japgolly$scalajs$react$vdom$HtmlAttrs$$undsetter$und$onClickCapture$und$eq__Ljapgolly_scalajs_react_vdom_Attr$Event__V(new $c_Ljapgolly_scalajs_react_vdom_Attr$Event().init___T("onClickCapture"));
  $thiz.japgolly$scalajs$react$vdom$HtmlAttrs$$undsetter$und$src$und$eq__Ljapgolly_scalajs_react_vdom_Attr__V(($m_Ljapgolly_scalajs_react_vdom_PackageBase$(), new $c_Ljapgolly_scalajs_react_vdom_Attr$Generic().init___T("src")));
  $thiz.japgolly$scalajs$react$vdom$HtmlAttrs$$undsetter$und$title$und$eq__Ljapgolly_scalajs_react_vdom_Attr__V(($m_Ljapgolly_scalajs_react_vdom_PackageBase$(), new $c_Ljapgolly_scalajs_react_vdom_Attr$Generic().init___T("title")));
  $thiz.japgolly$scalajs$react$vdom$HtmlAttrs$$undsetter$und$type$und$eq__Ljapgolly_scalajs_react_vdom_Attr__V(($m_Ljapgolly_scalajs_react_vdom_PackageBase$(), new $c_Ljapgolly_scalajs_react_vdom_Attr$Generic().init___T("type")));
  $thiz.japgolly$scalajs$react$vdom$HtmlAttrs$$undsetter$und$value$und$eq__Ljapgolly_scalajs_react_vdom_Attr__V(($m_Ljapgolly_scalajs_react_vdom_PackageBase$(), new $c_Ljapgolly_scalajs_react_vdom_Attr$Generic().init___T("value")))
}
function $f_Ljapgolly_scalajs_react_vdom_ImplicitsForVdomAttr1__vdomAttrVtKey__F1__F2($thiz, k) {
  $m_Ljapgolly_scalajs_react_vdom_Attr$ValueType$();
  var fn = new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function($this, k$1) {
    return (function(b$2, a$2) {
      var b = $as_F1(b$2);
      b.apply__O__O(k$1.apply__O__O(a$2))
    })
  })($thiz, k));
  return fn
}
function $f_Ljapgolly_scalajs_react_vdom_ImplicitsForVdomAttr1__$$init$__V($thiz) {
  $m_Ljapgolly_scalajs_react_vdom_Attr$ValueType$();
  var fn = new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function($this) {
    return (function(b$2, a$2) {
      var b = $as_F1(b$2);
      var t = $uJ(a$2);
      var lo = t.lo$2;
      var hi = t.hi$2;
      var s = $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toString__I__I__T(lo, hi);
      b.apply__O__O(s)
    })
  })($thiz));
  $thiz.vdomAttrVtKeyL$2 = fn;
  var k = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$1) {
    return (function(a$3$2) {
      var a$3 = $as_T(a$3$2);
      return a$3
    })
  })($thiz));
  $thiz.vdomAttrVtKeyS$2 = $f_Ljapgolly_scalajs_react_vdom_ImplicitsForVdomAttr1__vdomAttrVtKey__F1__F2($thiz, k)
}
function $is_Ljapgolly_scalajs_react_vdom_TagMod(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_vdom_TagMod)))
}
function $as_Ljapgolly_scalajs_react_vdom_TagMod(obj) {
  return (($is_Ljapgolly_scalajs_react_vdom_TagMod(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.vdom.TagMod"))
}
function $isArrayOf_Ljapgolly_scalajs_react_vdom_TagMod(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_vdom_TagMod)))
}
function $asArrayOf_Ljapgolly_scalajs_react_vdom_TagMod(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_vdom_TagMod(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.vdom.TagMod;", depth))
}
/** @constructor */
function $c_O() {
  /*<skip>*/
}
/** @constructor */
function $h_O() {
  /*<skip>*/
}
$h_O.prototype = $c_O.prototype;
$c_O.prototype.init___ = (function() {
  return this
});
$c_O.prototype.equals__O__Z = (function(that) {
  return (this === that)
});
$c_O.prototype.toString__T = (function() {
  var jsx$2 = $objectGetClass(this).getName__T();
  var i = this.hashCode__I();
  var x = $uD((i >>> 0));
  var jsx$1 = x.toString(16);
  return ((jsx$2 + "@") + $as_T(jsx$1))
});
$c_O.prototype.hashCode__I = (function() {
  return $systemIdentityHashCode(this)
});
$c_O.prototype.toString = (function() {
  return this.toString__T()
});
function $is_O(obj) {
  return (obj !== null)
}
function $as_O(obj) {
  return obj
}
function $isArrayOf_O(obj, depth) {
  var data = (obj && obj.$classData);
  if ((!data)) {
    return false
  } else {
    var arrayDepth = (data.arrayDepth || 0);
    return ((!(arrayDepth < depth)) && ((arrayDepth > depth) || (!data.arrayBase.isPrimitive)))
  }
}
function $asArrayOf_O(obj, depth) {
  return (($isArrayOf_O(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Object;", depth))
}
var $d_O = new $TypeData().initClass({
  O: 0
}, false, "java.lang.Object", {
  O: 1
}, (void 0), (void 0), $is_O, $isArrayOf_O);
$c_O.prototype.$classData = $d_O;
function $f_s_Proxy__equals__O__Z($thiz, that) {
  return ((that !== null) && (((that === $thiz) || (that === $thiz.self$1)) || $objectEquals(that, $thiz.self$1)))
}
function $f_s_Proxy__toString__T($thiz) {
  return ("" + $thiz.self$1)
}
function $f_s_util_control_NoStackTrace__fillInStackTrace__jl_Throwable($thiz) {
  var this$1 = $m_s_util_control_NoStackTrace$();
  if (this$1.$$undnoSuppression$1) {
    return $c_jl_Throwable.prototype.fillInStackTrace__jl_Throwable.call($thiz)
  } else {
    return $as_jl_Throwable($thiz)
  }
}
function $is_sc_GenTraversableOnce(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenTraversableOnce)))
}
function $as_sc_GenTraversableOnce(obj) {
  return (($is_sc_GenTraversableOnce(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.GenTraversableOnce"))
}
function $isArrayOf_sc_GenTraversableOnce(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenTraversableOnce)))
}
function $asArrayOf_sc_GenTraversableOnce(obj, depth) {
  return (($isArrayOf_sc_GenTraversableOnce(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.GenTraversableOnce;", depth))
}
function $f_sci_VectorPointer__copyOf__AO__AO($thiz, a) {
  var b = $newArrayObject($d_O.getArrayOf(), [a.u.length]);
  $systemArraycopy(a, 0, b, 0, a.u.length);
  return b
}
function $f_sci_VectorPointer__gotoNextBlockStart__I__I__V($thiz, index, xor) {
  if ((xor < 1024)) {
    $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get((31 & (index >> 5))), 1))
  } else if ((xor < 32768)) {
    $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get((31 & (index >> 10))), 1));
    $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get(0), 1))
  } else if ((xor < 1048576)) {
    $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().get((31 & (index >> 15))), 1));
    $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get(0), 1));
    $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get(0), 1))
  } else if ((xor < 33554432)) {
    $thiz.display3$und$eq__AO__V($asArrayOf_O($thiz.display4__AO().get((31 & (index >> 20))), 1));
    $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().get(0), 1));
    $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get(0), 1));
    $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get(0), 1))
  } else if ((xor < 1073741824)) {
    $thiz.display4$und$eq__AO__V($asArrayOf_O($thiz.display5__AO().get((31 & (index >> 25))), 1));
    $thiz.display3$und$eq__AO__V($asArrayOf_O($thiz.display4__AO().get(0), 1));
    $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().get(0), 1));
    $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get(0), 1));
    $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get(0), 1))
  } else {
    throw new $c_jl_IllegalArgumentException().init___()
  }
}
function $f_sci_VectorPointer__gotoFreshPosWritable1__I__I__I__V($thiz, oldIndex, newIndex, xor) {
  $f_sci_VectorPointer__stabilize__I__V($thiz, oldIndex);
  $f_sci_VectorPointer__gotoFreshPosWritable0__I__I__I__V($thiz, oldIndex, newIndex, xor)
}
function $f_sci_VectorPointer__getElem__I__I__O($thiz, index, xor) {
  if ((xor < 32)) {
    return $thiz.display0__AO().get((31 & index))
  } else if ((xor < 1024)) {
    return $asArrayOf_O($thiz.display1__AO().get((31 & (index >> 5))), 1).get((31 & index))
  } else if ((xor < 32768)) {
    return $asArrayOf_O($asArrayOf_O($thiz.display2__AO().get((31 & (index >> 10))), 1).get((31 & (index >> 5))), 1).get((31 & index))
  } else if ((xor < 1048576)) {
    return $asArrayOf_O($asArrayOf_O($asArrayOf_O($thiz.display3__AO().get((31 & (index >> 15))), 1).get((31 & (index >> 10))), 1).get((31 & (index >> 5))), 1).get((31 & index))
  } else if ((xor < 33554432)) {
    return $asArrayOf_O($asArrayOf_O($asArrayOf_O($asArrayOf_O($thiz.display4__AO().get((31 & (index >> 20))), 1).get((31 & (index >> 15))), 1).get((31 & (index >> 10))), 1).get((31 & (index >> 5))), 1).get((31 & index))
  } else if ((xor < 1073741824)) {
    return $asArrayOf_O($asArrayOf_O($asArrayOf_O($asArrayOf_O($asArrayOf_O($thiz.display5__AO().get((31 & (index >> 25))), 1).get((31 & (index >> 20))), 1).get((31 & (index >> 15))), 1).get((31 & (index >> 10))), 1).get((31 & (index >> 5))), 1).get((31 & index))
  } else {
    throw new $c_jl_IllegalArgumentException().init___()
  }
}
function $f_sci_VectorPointer__gotoFreshPosWritable0__I__I__I__V($thiz, oldIndex, newIndex, xor) {
  if ((xor >= 32)) {
    if ((xor < 1024)) {
      if (($thiz.depth__I() === 1)) {
        $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $thiz.display1__AO().set((31 & (oldIndex >> 5)), $thiz.display0__AO());
        $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
      };
      $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
    } else if ((xor < 32768)) {
      if (($thiz.depth__I() === 2)) {
        $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $thiz.display2__AO().set((31 & (oldIndex >> 10)), $thiz.display1__AO());
        $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
      };
      $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get((31 & (newIndex >> 10))), 1));
      if (($thiz.display1__AO() === null)) {
        $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
    } else if ((xor < 1048576)) {
      if (($thiz.depth__I() === 3)) {
        $thiz.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $thiz.display3__AO().set((31 & (oldIndex >> 15)), $thiz.display2__AO());
        $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
      };
      $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().get((31 & (newIndex >> 15))), 1));
      if (($thiz.display2__AO() === null)) {
        $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get((31 & (newIndex >> 10))), 1));
      if (($thiz.display1__AO() === null)) {
        $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
    } else if ((xor < 33554432)) {
      if (($thiz.depth__I() === 4)) {
        $thiz.display4$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $thiz.display4__AO().set((31 & (oldIndex >> 20)), $thiz.display3__AO());
        $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
      };
      $thiz.display3$und$eq__AO__V($asArrayOf_O($thiz.display4__AO().get((31 & (newIndex >> 20))), 1));
      if (($thiz.display3__AO() === null)) {
        $thiz.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().get((31 & (newIndex >> 15))), 1));
      if (($thiz.display2__AO() === null)) {
        $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get((31 & (newIndex >> 10))), 1));
      if (($thiz.display1__AO() === null)) {
        $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
    } else if ((xor < 1073741824)) {
      if (($thiz.depth__I() === 5)) {
        $thiz.display5$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
        $thiz.display5__AO().set((31 & (oldIndex >> 25)), $thiz.display4__AO());
        $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
      };
      $thiz.display4$und$eq__AO__V($asArrayOf_O($thiz.display5__AO().get((31 & (newIndex >> 25))), 1));
      if (($thiz.display4__AO() === null)) {
        $thiz.display4$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display3$und$eq__AO__V($asArrayOf_O($thiz.display4__AO().get((31 & (newIndex >> 20))), 1));
      if (($thiz.display3__AO() === null)) {
        $thiz.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().get((31 & (newIndex >> 15))), 1));
      if (($thiz.display2__AO() === null)) {
        $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get((31 & (newIndex >> 10))), 1));
      if (($thiz.display1__AO() === null)) {
        $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
      };
      $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]))
    } else {
      throw new $c_jl_IllegalArgumentException().init___()
    }
  }
}
function $f_sci_VectorPointer__gotoPosWritable1__I__I__I__V($thiz, oldIndex, newIndex, xor) {
  if ((xor < 32)) {
    var a = $thiz.display0__AO();
    $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a))
  } else if ((xor < 1024)) {
    var a$1 = $thiz.display1__AO();
    $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$1));
    $thiz.display1__AO().set((31 & (oldIndex >> 5)), $thiz.display0__AO());
    var array = $thiz.display1__AO();
    var index = (31 & (newIndex >> 5));
    $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array, index))
  } else if ((xor < 32768)) {
    var a$2 = $thiz.display1__AO();
    $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$2));
    var a$3 = $thiz.display2__AO();
    $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$3));
    $thiz.display1__AO().set((31 & (oldIndex >> 5)), $thiz.display0__AO());
    $thiz.display2__AO().set((31 & (oldIndex >> 10)), $thiz.display1__AO());
    var array$1 = $thiz.display2__AO();
    var index$1 = (31 & (newIndex >> 10));
    $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$1, index$1));
    var array$2 = $thiz.display1__AO();
    var index$2 = (31 & (newIndex >> 5));
    $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$2, index$2))
  } else if ((xor < 1048576)) {
    var a$4 = $thiz.display1__AO();
    $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$4));
    var a$5 = $thiz.display2__AO();
    $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$5));
    var a$6 = $thiz.display3__AO();
    $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$6));
    $thiz.display1__AO().set((31 & (oldIndex >> 5)), $thiz.display0__AO());
    $thiz.display2__AO().set((31 & (oldIndex >> 10)), $thiz.display1__AO());
    $thiz.display3__AO().set((31 & (oldIndex >> 15)), $thiz.display2__AO());
    var array$3 = $thiz.display3__AO();
    var index$3 = (31 & (newIndex >> 15));
    $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$3, index$3));
    var array$4 = $thiz.display2__AO();
    var index$4 = (31 & (newIndex >> 10));
    $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$4, index$4));
    var array$5 = $thiz.display1__AO();
    var index$5 = (31 & (newIndex >> 5));
    $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$5, index$5))
  } else if ((xor < 33554432)) {
    var a$7 = $thiz.display1__AO();
    $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$7));
    var a$8 = $thiz.display2__AO();
    $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$8));
    var a$9 = $thiz.display3__AO();
    $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$9));
    var a$10 = $thiz.display4__AO();
    $thiz.display4$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$10));
    $thiz.display1__AO().set((31 & (oldIndex >> 5)), $thiz.display0__AO());
    $thiz.display2__AO().set((31 & (oldIndex >> 10)), $thiz.display1__AO());
    $thiz.display3__AO().set((31 & (oldIndex >> 15)), $thiz.display2__AO());
    $thiz.display4__AO().set((31 & (oldIndex >> 20)), $thiz.display3__AO());
    var array$6 = $thiz.display4__AO();
    var index$6 = (31 & (newIndex >> 20));
    $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$6, index$6));
    var array$7 = $thiz.display3__AO();
    var index$7 = (31 & (newIndex >> 15));
    $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$7, index$7));
    var array$8 = $thiz.display2__AO();
    var index$8 = (31 & (newIndex >> 10));
    $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$8, index$8));
    var array$9 = $thiz.display1__AO();
    var index$9 = (31 & (newIndex >> 5));
    $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$9, index$9))
  } else if ((xor < 1073741824)) {
    var a$11 = $thiz.display1__AO();
    $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$11));
    var a$12 = $thiz.display2__AO();
    $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$12));
    var a$13 = $thiz.display3__AO();
    $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$13));
    var a$14 = $thiz.display4__AO();
    $thiz.display4$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$14));
    var a$15 = $thiz.display5__AO();
    $thiz.display5$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$15));
    $thiz.display1__AO().set((31 & (oldIndex >> 5)), $thiz.display0__AO());
    $thiz.display2__AO().set((31 & (oldIndex >> 10)), $thiz.display1__AO());
    $thiz.display3__AO().set((31 & (oldIndex >> 15)), $thiz.display2__AO());
    $thiz.display4__AO().set((31 & (oldIndex >> 20)), $thiz.display3__AO());
    $thiz.display5__AO().set((31 & (oldIndex >> 25)), $thiz.display4__AO());
    var array$10 = $thiz.display5__AO();
    var index$10 = (31 & (newIndex >> 25));
    $thiz.display4$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$10, index$10));
    var array$11 = $thiz.display4__AO();
    var index$11 = (31 & (newIndex >> 20));
    $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$11, index$11));
    var array$12 = $thiz.display3__AO();
    var index$12 = (31 & (newIndex >> 15));
    $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$12, index$12));
    var array$13 = $thiz.display2__AO();
    var index$13 = (31 & (newIndex >> 10));
    $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$13, index$13));
    var array$14 = $thiz.display1__AO();
    var index$14 = (31 & (newIndex >> 5));
    $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$14, index$14))
  } else {
    throw new $c_jl_IllegalArgumentException().init___()
  }
}
function $f_sci_VectorPointer__copyRange__AO__I__I__AO($thiz, array, oldLeft, newLeft) {
  var elems = $newArrayObject($d_O.getArrayOf(), [32]);
  $systemArraycopy(array, oldLeft, elems, newLeft, ((32 - ((newLeft > oldLeft) ? newLeft : oldLeft)) | 0));
  return elems
}
function $f_sci_VectorPointer__gotoPos__I__I__V($thiz, index, xor) {
  if ((xor >= 32)) {
    if ((xor < 1024)) {
      $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get((31 & (index >> 5))), 1))
    } else if ((xor < 32768)) {
      $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get((31 & (index >> 10))), 1));
      $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get((31 & (index >> 5))), 1))
    } else if ((xor < 1048576)) {
      $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().get((31 & (index >> 15))), 1));
      $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get((31 & (index >> 10))), 1));
      $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get((31 & (index >> 5))), 1))
    } else if ((xor < 33554432)) {
      $thiz.display3$und$eq__AO__V($asArrayOf_O($thiz.display4__AO().get((31 & (index >> 20))), 1));
      $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().get((31 & (index >> 15))), 1));
      $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get((31 & (index >> 10))), 1));
      $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get((31 & (index >> 5))), 1))
    } else if ((xor < 1073741824)) {
      $thiz.display4$und$eq__AO__V($asArrayOf_O($thiz.display5__AO().get((31 & (index >> 25))), 1));
      $thiz.display3$und$eq__AO__V($asArrayOf_O($thiz.display4__AO().get((31 & (index >> 20))), 1));
      $thiz.display2$und$eq__AO__V($asArrayOf_O($thiz.display3__AO().get((31 & (index >> 15))), 1));
      $thiz.display1$und$eq__AO__V($asArrayOf_O($thiz.display2__AO().get((31 & (index >> 10))), 1));
      $thiz.display0$und$eq__AO__V($asArrayOf_O($thiz.display1__AO().get((31 & (index >> 5))), 1))
    } else {
      throw new $c_jl_IllegalArgumentException().init___()
    }
  }
}
function $f_sci_VectorPointer__gotoPosWritable0__I__I__V($thiz, newIndex, xor) {
  var x1 = (((-1) + $thiz.depth__I()) | 0);
  switch (x1) {
    case 5: {
      var a = $thiz.display5__AO();
      $thiz.display5$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a));
      var array = $thiz.display5__AO();
      var index = (31 & (newIndex >> 25));
      $thiz.display4$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array, index));
      var array$1 = $thiz.display4__AO();
      var index$1 = (31 & (newIndex >> 20));
      $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$1, index$1));
      var array$2 = $thiz.display3__AO();
      var index$2 = (31 & (newIndex >> 15));
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$2, index$2));
      var array$3 = $thiz.display2__AO();
      var index$3 = (31 & (newIndex >> 10));
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$3, index$3));
      var array$4 = $thiz.display1__AO();
      var index$4 = (31 & (newIndex >> 5));
      $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$4, index$4));
      break
    }
    case 4: {
      var a$1 = $thiz.display4__AO();
      $thiz.display4$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$1));
      var array$5 = $thiz.display4__AO();
      var index$5 = (31 & (newIndex >> 20));
      $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$5, index$5));
      var array$6 = $thiz.display3__AO();
      var index$6 = (31 & (newIndex >> 15));
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$6, index$6));
      var array$7 = $thiz.display2__AO();
      var index$7 = (31 & (newIndex >> 10));
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$7, index$7));
      var array$8 = $thiz.display1__AO();
      var index$8 = (31 & (newIndex >> 5));
      $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$8, index$8));
      break
    }
    case 3: {
      var a$2 = $thiz.display3__AO();
      $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$2));
      var array$9 = $thiz.display3__AO();
      var index$9 = (31 & (newIndex >> 15));
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$9, index$9));
      var array$10 = $thiz.display2__AO();
      var index$10 = (31 & (newIndex >> 10));
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$10, index$10));
      var array$11 = $thiz.display1__AO();
      var index$11 = (31 & (newIndex >> 5));
      $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$11, index$11));
      break
    }
    case 2: {
      var a$3 = $thiz.display2__AO();
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$3));
      var array$12 = $thiz.display2__AO();
      var index$12 = (31 & (newIndex >> 10));
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$12, index$12));
      var array$13 = $thiz.display1__AO();
      var index$13 = (31 & (newIndex >> 5));
      $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$13, index$13));
      break
    }
    case 1: {
      var a$4 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$4));
      var array$14 = $thiz.display1__AO();
      var index$14 = (31 & (newIndex >> 5));
      $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array$14, index$14));
      break
    }
    case 0: {
      var a$5 = $thiz.display0__AO();
      $thiz.display0$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$5));
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(x1)
    }
  }
}
function $f_sci_VectorPointer__stabilize__I__V($thiz, index) {
  var x1 = (((-1) + $thiz.depth__I()) | 0);
  switch (x1) {
    case 5: {
      var a = $thiz.display5__AO();
      $thiz.display5$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a));
      var a$1 = $thiz.display4__AO();
      $thiz.display4$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$1));
      var a$2 = $thiz.display3__AO();
      $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$2));
      var a$3 = $thiz.display2__AO();
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$3));
      var a$4 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$4));
      $thiz.display5__AO().set((31 & (index >> 25)), $thiz.display4__AO());
      $thiz.display4__AO().set((31 & (index >> 20)), $thiz.display3__AO());
      $thiz.display3__AO().set((31 & (index >> 15)), $thiz.display2__AO());
      $thiz.display2__AO().set((31 & (index >> 10)), $thiz.display1__AO());
      $thiz.display1__AO().set((31 & (index >> 5)), $thiz.display0__AO());
      break
    }
    case 4: {
      var a$5 = $thiz.display4__AO();
      $thiz.display4$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$5));
      var a$6 = $thiz.display3__AO();
      $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$6));
      var a$7 = $thiz.display2__AO();
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$7));
      var a$8 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$8));
      $thiz.display4__AO().set((31 & (index >> 20)), $thiz.display3__AO());
      $thiz.display3__AO().set((31 & (index >> 15)), $thiz.display2__AO());
      $thiz.display2__AO().set((31 & (index >> 10)), $thiz.display1__AO());
      $thiz.display1__AO().set((31 & (index >> 5)), $thiz.display0__AO());
      break
    }
    case 3: {
      var a$9 = $thiz.display3__AO();
      $thiz.display3$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$9));
      var a$10 = $thiz.display2__AO();
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$10));
      var a$11 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$11));
      $thiz.display3__AO().set((31 & (index >> 15)), $thiz.display2__AO());
      $thiz.display2__AO().set((31 & (index >> 10)), $thiz.display1__AO());
      $thiz.display1__AO().set((31 & (index >> 5)), $thiz.display0__AO());
      break
    }
    case 2: {
      var a$12 = $thiz.display2__AO();
      $thiz.display2$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$12));
      var a$13 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$13));
      $thiz.display2__AO().set((31 & (index >> 10)), $thiz.display1__AO());
      $thiz.display1__AO().set((31 & (index >> 5)), $thiz.display0__AO());
      break
    }
    case 1: {
      var a$14 = $thiz.display1__AO();
      $thiz.display1$und$eq__AO__V($f_sci_VectorPointer__copyOf__AO__AO($thiz, a$14));
      $thiz.display1__AO().set((31 & (index >> 5)), $thiz.display0__AO());
      break
    }
    case 0: {
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(x1)
    }
  }
}
function $f_sci_VectorPointer__nullSlotAndCopy__AO__I__AO($thiz, array, index) {
  var x = array.get(index);
  array.set(index, null);
  var a = $asArrayOf_O(x, 1);
  return $f_sci_VectorPointer__copyOf__AO__AO($thiz, a)
}
function $f_sci_VectorPointer__debug__V($thiz) {
  return (void 0)
}
function $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V($thiz, that, depth) {
  $thiz.depth$und$eq__I__V(depth);
  var x1 = (((-1) + depth) | 0);
  switch (x1) {
    case (-1): {
      break
    }
    case 0: {
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 1: {
      $thiz.display1$und$eq__AO__V(that.display1__AO());
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 2: {
      $thiz.display2$und$eq__AO__V(that.display2__AO());
      $thiz.display1$und$eq__AO__V(that.display1__AO());
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 3: {
      $thiz.display3$und$eq__AO__V(that.display3__AO());
      $thiz.display2$und$eq__AO__V(that.display2__AO());
      $thiz.display1$und$eq__AO__V(that.display1__AO());
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 4: {
      $thiz.display4$und$eq__AO__V(that.display4__AO());
      $thiz.display3$und$eq__AO__V(that.display3__AO());
      $thiz.display2$und$eq__AO__V(that.display2__AO());
      $thiz.display1$und$eq__AO__V(that.display1__AO());
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    case 5: {
      $thiz.display5$und$eq__AO__V(that.display5__AO());
      $thiz.display4$und$eq__AO__V(that.display4__AO());
      $thiz.display3$und$eq__AO__V(that.display3__AO());
      $thiz.display2$und$eq__AO__V(that.display2__AO());
      $thiz.display1$und$eq__AO__V(that.display1__AO());
      $thiz.display0$und$eq__AO__V(that.display0__AO());
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(x1)
    }
  }
}
function $f_sci_VectorPointer__gotoNextBlockStartWritable__I__I__V($thiz, index, xor) {
  if ((xor < 1024)) {
    if (($thiz.depth__I() === 1)) {
      $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $thiz.display1__AO().set(0, $thiz.display0__AO());
      $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
    };
    $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1__AO().set((31 & (index >> 5)), $thiz.display0__AO())
  } else if ((xor < 32768)) {
    if (($thiz.depth__I() === 2)) {
      $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $thiz.display2__AO().set(0, $thiz.display1__AO());
      $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
    };
    $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1__AO().set((31 & (index >> 5)), $thiz.display0__AO());
    $thiz.display2__AO().set((31 & (index >> 10)), $thiz.display1__AO())
  } else if ((xor < 1048576)) {
    if (($thiz.depth__I() === 3)) {
      $thiz.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $thiz.display3__AO().set(0, $thiz.display2__AO());
      $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
    };
    $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1__AO().set((31 & (index >> 5)), $thiz.display0__AO());
    $thiz.display2__AO().set((31 & (index >> 10)), $thiz.display1__AO());
    $thiz.display3__AO().set((31 & (index >> 15)), $thiz.display2__AO())
  } else if ((xor < 33554432)) {
    if (($thiz.depth__I() === 4)) {
      $thiz.display4$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $thiz.display4__AO().set(0, $thiz.display3__AO());
      $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
    };
    $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1__AO().set((31 & (index >> 5)), $thiz.display0__AO());
    $thiz.display2__AO().set((31 & (index >> 10)), $thiz.display1__AO());
    $thiz.display3__AO().set((31 & (index >> 15)), $thiz.display2__AO());
    $thiz.display4__AO().set((31 & (index >> 20)), $thiz.display3__AO())
  } else if ((xor < 1073741824)) {
    if (($thiz.depth__I() === 5)) {
      $thiz.display5$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
      $thiz.display5__AO().set(0, $thiz.display4__AO());
      $thiz.depth$und$eq__I__V(((1 + $thiz.depth__I()) | 0))
    };
    $thiz.display0$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display2$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display3$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display4$und$eq__AO__V($newArrayObject($d_O.getArrayOf(), [32]));
    $thiz.display1__AO().set((31 & (index >> 5)), $thiz.display0__AO());
    $thiz.display2__AO().set((31 & (index >> 10)), $thiz.display1__AO());
    $thiz.display3__AO().set((31 & (index >> 15)), $thiz.display2__AO());
    $thiz.display4__AO().set((31 & (index >> 20)), $thiz.display3__AO());
    $thiz.display5__AO().set((31 & (index >> 25)), $thiz.display4__AO())
  } else {
    throw new $c_jl_IllegalArgumentException().init___()
  }
}
/** @constructor */
function $c_Lcom_ouspark_dashboard_components_Navigation$() {
  $c_O.call(this);
  this.component$1 = null
}
$c_Lcom_ouspark_dashboard_components_Navigation$.prototype = new $h_O();
$c_Lcom_ouspark_dashboard_components_Navigation$.prototype.constructor = $c_Lcom_ouspark_dashboard_components_Navigation$;
/** @constructor */
function $h_Lcom_ouspark_dashboard_components_Navigation$() {
  /*<skip>*/
}
$h_Lcom_ouspark_dashboard_components_Navigation$.prototype = $c_Lcom_ouspark_dashboard_components_Navigation$.prototype;
$c_Lcom_ouspark_dashboard_components_Navigation$.prototype.init___ = (function() {
  $n_Lcom_ouspark_dashboard_components_Navigation$ = this;
  var jsx$15 = $m_Ljapgolly_scalajs_react_package$().ScalaComponent$1.builder$1;
  $m_Ljapgolly_scalajs_react_vdom_all$();
  var jsx$14 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  $m_Ljapgolly_scalajs_react_vdom_all$();
  $m_Ljapgolly_scalajs_react_vdom_all$();
  $m_Ljapgolly_scalajs_react_vdom_PackageBase$();
  var this$4 = new $c_Ljapgolly_scalajs_react_vdom_Attr$Generic().init___T("id");
  var t = $m_Ljapgolly_scalajs_react_vdom_all$().vdomAttrVtString$2;
  var jsx$13 = jsx$14.apply$extension__T__sc_Seq__Ljapgolly_scalajs_react_vdom_TagOf("div", new $c_sjs_js_WrappedArray().init___sjs_js_Array([$m_Ljapgolly_scalajs_react_vdom_Attr$ValueType$().apply$extension__F2__T__O__Ljapgolly_scalajs_react_vdom_TagMod(t, this$4.name$1, "navbar"), ($m_Ljapgolly_scalajs_react_vdom_all$(), $m_Ljapgolly_scalajs_react_vdom_Attr$ClassName$()).$$colon$eq__O__F2__Ljapgolly_scalajs_react_vdom_TagMod("navbar navbar-default ace-save-state", $m_Ljapgolly_scalajs_react_vdom_all$().vdomAttrVtString$2)]));
  var jsx$12 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  $m_Ljapgolly_scalajs_react_vdom_all$();
  var jsx$11 = ($m_Ljapgolly_scalajs_react_vdom_all$(), $m_Ljapgolly_scalajs_react_vdom_Attr$ClassName$()).$$colon$eq__O__F2__Ljapgolly_scalajs_react_vdom_TagMod("navbar-container ace-save-state", $m_Ljapgolly_scalajs_react_vdom_all$().vdomAttrVtString$2);
  $m_Ljapgolly_scalajs_react_vdom_all$();
  $m_Ljapgolly_scalajs_react_vdom_PackageBase$();
  var this$10 = new $c_Ljapgolly_scalajs_react_vdom_Attr$Generic().init___T("id");
  var t$1 = $m_Ljapgolly_scalajs_react_vdom_all$().vdomAttrVtString$2;
  var jsx$10 = jsx$12.apply$extension__T__sc_Seq__Ljapgolly_scalajs_react_vdom_TagOf("div", new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$11, $m_Ljapgolly_scalajs_react_vdom_Attr$ValueType$().apply$extension__F2__T__O__Ljapgolly_scalajs_react_vdom_TagMod(t$1, this$10.name$1, "navbar-container")]));
  var jsx$9 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  $m_Ljapgolly_scalajs_react_vdom_all$();
  var this$12 = $m_Ljapgolly_scalajs_react_vdom_all$();
  var jsx$8 = this$12.type$3.$$colon$eq__O__F2__Ljapgolly_scalajs_react_vdom_TagMod("button", $m_Ljapgolly_scalajs_react_vdom_all$().vdomAttrVtString$2);
  var jsx$7 = ($m_Ljapgolly_scalajs_react_vdom_all$(), $m_Ljapgolly_scalajs_react_vdom_Attr$ClassName$()).$$colon$eq__O__F2__Ljapgolly_scalajs_react_vdom_TagMod("navbar-toggle menu-toggler pull-left", $m_Ljapgolly_scalajs_react_vdom_all$().vdomAttrVtString$2);
  $m_Ljapgolly_scalajs_react_vdom_all$();
  $m_Ljapgolly_scalajs_react_vdom_PackageBase$();
  var this$16 = new $c_Ljapgolly_scalajs_react_vdom_Attr$Generic().init___T("id");
  var t$2 = $m_Ljapgolly_scalajs_react_vdom_all$().vdomAttrVtString$2;
  var jsx$6 = jsx$9.apply$extension__T__sc_Seq__Ljapgolly_scalajs_react_vdom_TagOf("button", new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$8, jsx$7, $m_Ljapgolly_scalajs_react_vdom_Attr$ValueType$().apply$extension__F2__T__O__Ljapgolly_scalajs_react_vdom_TagMod(t$2, this$16.name$1, "menu-toggler")])).apply__sc_Seq__Ljapgolly_scalajs_react_vdom_TagOf(new $c_sjs_js_WrappedArray().init___sjs_js_Array([$m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$().apply$extension__T__sc_Seq__Ljapgolly_scalajs_react_vdom_TagOf(($m_Ljapgolly_scalajs_react_vdom_all$(), "span"), new $c_sjs_js_WrappedArray().init___sjs_js_Array([($m_Ljapgolly_scalajs_react_vdom_all$(), $m_Ljapgolly_scalajs_react_vdom_Attr$ClassName$()).$$colon$eq__O__F2__Ljapgolly_scalajs_react_vdom_TagMod("sr-only", $m_Ljapgolly_scalajs_react_vdom_all$().vdomAttrVtString$2)])).apply__sc_Seq__Ljapgolly_scalajs_react_vdom_TagOf(new $c_sjs_js_WrappedArray().init___sjs_js_Array([($m_Ljapgolly_scalajs_react_vdom_all$(), new $c_Ljapgolly_scalajs_react_vdom_VdomNode().init___sjs_js_$bar("Tonggle sidebar"))])), $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$().apply$extension__T__sc_Seq__Ljapgolly_scalajs_react_vdom_TagOf(($m_Ljapgolly_scalajs_react_vdom_all$(), "span"), new $c_sjs_js_WrappedArray().init___sjs_js_Array([($m_Ljapgolly_scalajs_react_vdom_all$(), $m_Ljapgolly_scalajs_react_vdom_Attr$ClassName$()).$$colon$eq__O__F2__Ljapgolly_scalajs_react_vdom_TagMod("icon-bar", $m_Ljapgolly_scalajs_react_vdom_all$().vdomAttrVtString$2)])), $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$().apply$extension__T__sc_Seq__Ljapgolly_scalajs_react_vdom_TagOf(($m_Ljapgolly_scalajs_react_vdom_all$(), "span"), new $c_sjs_js_WrappedArray().init___sjs_js_Array([($m_Ljapgolly_scalajs_react_vdom_all$(), $m_Ljapgolly_scalajs_react_vdom_Attr$ClassName$()).$$colon$eq__O__F2__Ljapgolly_scalajs_react_vdom_TagMod("icon-bar", $m_Ljapgolly_scalajs_react_vdom_all$().vdomAttrVtString$2)])), $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$().apply$extension__T__sc_Seq__Ljapgolly_scalajs_react_vdom_TagOf(($m_Ljapgolly_scalajs_react_vdom_all$(), "span"), new $c_sjs_js_WrappedArray().init___sjs_js_Array([($m_Ljapgolly_scalajs_react_vdom_all$(), $m_Ljapgolly_scalajs_react_vdom_Attr$ClassName$()).$$colon$eq__O__F2__Ljapgolly_scalajs_react_vdom_TagMod("icon-bar", $m_Ljapgolly_scalajs_react_vdom_all$().vdomAttrVtString$2)]))]));
  var jsx$5 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$().apply$extension__T__sc_Seq__Ljapgolly_scalajs_react_vdom_TagOf(($m_Ljapgolly_scalajs_react_vdom_all$(), "div"), new $c_sjs_js_WrappedArray().init___sjs_js_Array([($m_Ljapgolly_scalajs_react_vdom_all$(), $m_Ljapgolly_scalajs_react_vdom_Attr$ClassName$()).$$colon$eq__O__F2__Ljapgolly_scalajs_react_vdom_TagMod("navbar-header pull-left", $m_Ljapgolly_scalajs_react_vdom_all$().vdomAttrVtString$2)]));
  var jsx$4 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  $m_Ljapgolly_scalajs_react_vdom_all$();
  $m_Ljapgolly_scalajs_react_vdom_all$();
  $m_Ljapgolly_scalajs_react_vdom_PackageBase$();
  var this$32 = new $c_Ljapgolly_scalajs_react_vdom_Attr$Generic().init___T("href");
  var t$3 = $m_Ljapgolly_scalajs_react_vdom_all$().vdomAttrVtString$2;
  var jsx$3 = jsx$5.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_TagOf(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$4.apply$extension__T__sc_Seq__Ljapgolly_scalajs_react_vdom_TagOf("a", new $c_sjs_js_WrappedArray().init___sjs_js_Array([$m_Ljapgolly_scalajs_react_vdom_Attr$ValueType$().apply$extension__F2__T__O__Ljapgolly_scalajs_react_vdom_TagMod(t$3, this$32.name$1, "google.com"), ($m_Ljapgolly_scalajs_react_vdom_all$(), $m_Ljapgolly_scalajs_react_vdom_Attr$ClassName$()).$$colon$eq__O__F2__Ljapgolly_scalajs_react_vdom_TagMod("navbar-brand", $m_Ljapgolly_scalajs_react_vdom_all$().vdomAttrVtString$2)])).apply__sc_Seq__Ljapgolly_scalajs_react_vdom_TagOf(new $c_sjs_js_WrappedArray().init___sjs_js_Array([$m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$().apply$extension__T__sc_Seq__Ljapgolly_scalajs_react_vdom_TagOf(($m_Ljapgolly_scalajs_react_vdom_all$(), "small"), new $c_sjs_js_WrappedArray().init___sjs_js_Array([$m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$().apply$extension__T__sc_Seq__Ljapgolly_scalajs_react_vdom_TagOf(($m_Ljapgolly_scalajs_react_vdom_all$(), "i"), new $c_sjs_js_WrappedArray().init___sjs_js_Array([($m_Ljapgolly_scalajs_react_vdom_all$(), $m_Ljapgolly_scalajs_react_vdom_Attr$ClassName$()).$$colon$eq__O__F2__Ljapgolly_scalajs_react_vdom_TagMod("fa fa-yelp", $m_Ljapgolly_scalajs_react_vdom_all$().vdomAttrVtString$2)])), ($m_Ljapgolly_scalajs_react_vdom_all$(), new $c_Ljapgolly_scalajs_react_vdom_VdomNode().init___sjs_js_$bar(" Ouspark's Admin"))]))]))]));
  var jsx$2 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  $m_Ljapgolly_scalajs_react_vdom_all$();
  var jsx$1 = ($m_Ljapgolly_scalajs_react_vdom_all$(), $m_Ljapgolly_scalajs_react_vdom_Attr$ClassName$()).$$colon$eq__O__F2__Ljapgolly_scalajs_react_vdom_TagMod("navbar-buttons navbar-header pull-right", $m_Ljapgolly_scalajs_react_vdom_all$().vdomAttrVtString$2);
  $m_Ljapgolly_scalajs_react_vdom_all$();
  $m_Ljapgolly_scalajs_react_vdom_PackageBase$();
  var this$43 = new $c_Ljapgolly_scalajs_react_vdom_Attr$Generic().init___T("role");
  var t$4 = $m_Ljapgolly_scalajs_react_vdom_all$().vdomAttrVtString$2;
  var a = jsx$13.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_TagOf(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$10.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_TagOf(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$6, jsx$3, jsx$2.apply$extension__T__sc_Seq__Ljapgolly_scalajs_react_vdom_TagOf("div", new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$1, $m_Ljapgolly_scalajs_react_vdom_Attr$ValueType$().apply$extension__F2__T__O__Ljapgolly_scalajs_react_vdom_TagMod(t$4, this$43.name$1, "navigation")])).apply__sc_Seq__Ljapgolly_scalajs_react_vdom_TagOf($m_sci_Nil$())]))]));
  this.component$1 = jsx$15.$static__T__Ljapgolly_scalajs_react_vdom_VdomElement__Ljapgolly_scalajs_react_component_ScalaBuilder$Step4("Navigation", a.render__Ljapgolly_scalajs_react_vdom_VdomElement()).build__Ljapgolly_scalajs_react_CtorType$Summoner__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot($m_Ljapgolly_scalajs_react_CtorType$Summoner$().summonN__Ljapgolly_scalajs_react_internal_Singleton__Ljapgolly_scalajs_react_CtorType$Summoner($m_Ljapgolly_scalajs_react_internal_Singleton$().BoxUnit$1));
  return this
});
$c_Lcom_ouspark_dashboard_components_Navigation$.prototype.apply__Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot = (function() {
  var c = this.component$1;
  return $as_Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot($as_Ljapgolly_scalajs_react_CtorType$Nullary(c.ctor__Ljapgolly_scalajs_react_CtorType()).apply__O())
});
var $d_Lcom_ouspark_dashboard_components_Navigation$ = new $TypeData().initClass({
  Lcom_ouspark_dashboard_components_Navigation$: 0
}, false, "com.ouspark.dashboard.components.Navigation$", {
  Lcom_ouspark_dashboard_components_Navigation$: 1,
  O: 1
});
$c_Lcom_ouspark_dashboard_components_Navigation$.prototype.$classData = $d_Lcom_ouspark_dashboard_components_Navigation$;
var $n_Lcom_ouspark_dashboard_components_Navigation$ = (void 0);
function $m_Lcom_ouspark_dashboard_components_Navigation$() {
  if ((!$n_Lcom_ouspark_dashboard_components_Navigation$)) {
    $n_Lcom_ouspark_dashboard_components_Navigation$ = new $c_Lcom_ouspark_dashboard_components_Navigation$().init___()
  };
  return $n_Lcom_ouspark_dashboard_components_Navigation$
}
/** @constructor */
function $c_Lcom_ouspark_dashboard_pages_DashboardPage$() {
  $c_O.call(this);
  this.component$1 = null
}
$c_Lcom_ouspark_dashboard_pages_DashboardPage$.prototype = new $h_O();
$c_Lcom_ouspark_dashboard_pages_DashboardPage$.prototype.constructor = $c_Lcom_ouspark_dashboard_pages_DashboardPage$;
/** @constructor */
function $h_Lcom_ouspark_dashboard_pages_DashboardPage$() {
  /*<skip>*/
}
$h_Lcom_ouspark_dashboard_pages_DashboardPage$.prototype = $c_Lcom_ouspark_dashboard_pages_DashboardPage$.prototype;
$c_Lcom_ouspark_dashboard_pages_DashboardPage$.prototype.init___ = (function() {
  $n_Lcom_ouspark_dashboard_pages_DashboardPage$ = this;
  var jsx$1 = $m_Ljapgolly_scalajs_react_package$().ScalaComponent$1.builder$1;
  $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  var a = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$().apply$extension__T__sc_Seq__Ljapgolly_scalajs_react_vdom_TagOf(($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), "div"), new $c_sjs_js_WrappedArray().init___sjs_js_Array([($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), $m_Ljapgolly_scalajs_react_vdom_Attr$ClassName$()).$$colon$eq__O__F2__Ljapgolly_scalajs_react_vdom_TagMod("class", $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$().vdomAttrVtString$2), ($m_Ljapgolly_scalajs_react_vdom_html$und$less$up$(), new $c_Ljapgolly_scalajs_react_vdom_VdomNode().init___sjs_js_$bar("Dashboard"))]));
  this.component$1 = jsx$1.$static__T__Ljapgolly_scalajs_react_vdom_VdomElement__Ljapgolly_scalajs_react_component_ScalaBuilder$Step4("Dashboard", a.render__Ljapgolly_scalajs_react_vdom_VdomElement()).build__Ljapgolly_scalajs_react_CtorType$Summoner__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot($m_Ljapgolly_scalajs_react_CtorType$Summoner$().summonN__Ljapgolly_scalajs_react_internal_Singleton__Ljapgolly_scalajs_react_CtorType$Summoner($m_Ljapgolly_scalajs_react_internal_Singleton$().BoxUnit$1));
  return this
});
$c_Lcom_ouspark_dashboard_pages_DashboardPage$.prototype.apply__Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot = (function() {
  var c = this.component$1;
  return $as_Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot($as_Ljapgolly_scalajs_react_CtorType$Nullary(c.ctor__Ljapgolly_scalajs_react_CtorType()).apply__O())
});
var $d_Lcom_ouspark_dashboard_pages_DashboardPage$ = new $TypeData().initClass({
  Lcom_ouspark_dashboard_pages_DashboardPage$: 0
}, false, "com.ouspark.dashboard.pages.DashboardPage$", {
  Lcom_ouspark_dashboard_pages_DashboardPage$: 1,
  O: 1
});
$c_Lcom_ouspark_dashboard_pages_DashboardPage$.prototype.$classData = $d_Lcom_ouspark_dashboard_pages_DashboardPage$;
var $n_Lcom_ouspark_dashboard_pages_DashboardPage$ = (void 0);
function $m_Lcom_ouspark_dashboard_pages_DashboardPage$() {
  if ((!$n_Lcom_ouspark_dashboard_pages_DashboardPage$)) {
    $n_Lcom_ouspark_dashboard_pages_DashboardPage$ = new $c_Lcom_ouspark_dashboard_pages_DashboardPage$().init___()
  };
  return $n_Lcom_ouspark_dashboard_pages_DashboardPage$
}
/** @constructor */
function $c_Lcom_ouspark_dashboard_routes_AppRouter$() {
  $c_O.call(this);
  this.config$1 = null;
  this.baseUrl$1 = null;
  this.router$1 = null
}
$c_Lcom_ouspark_dashboard_routes_AppRouter$.prototype = new $h_O();
$c_Lcom_ouspark_dashboard_routes_AppRouter$.prototype.constructor = $c_Lcom_ouspark_dashboard_routes_AppRouter$;
/** @constructor */
function $h_Lcom_ouspark_dashboard_routes_AppRouter$() {
  /*<skip>*/
}
$h_Lcom_ouspark_dashboard_routes_AppRouter$.prototype = $c_Lcom_ouspark_dashboard_routes_AppRouter$.prototype;
$c_Lcom_ouspark_dashboard_routes_AppRouter$.prototype.init___ = (function() {
  $n_Lcom_ouspark_dashboard_routes_AppRouter$ = this;
  new $c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$BuildInterface().init___();
  var arg1 = new $c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl().init___();
  var jsx$1 = arg1.trimSlashes__Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule();
  var r = new $c_Ljapgolly_scalajs_react_extra_router_Path().init___T("");
  var $$this = arg1.staticRoute__Ljapgolly_scalajs_react_extra_router_StaticDsl$Route__O__F1($m_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB$().literal__T__Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB(r.value$2).route__Ljapgolly_scalajs_react_extra_router_StaticDsl$Route(), $m_Lcom_ouspark_dashboard_routes_AppRouter$Dashboard$());
  var a = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2$1, dsl) {
    return (function() {
      return dsl.render__F0__F1__Ljapgolly_scalajs_react_extra_router_Renderer(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
        return (function() {
          return $m_Lcom_ouspark_dashboard_pages_DashboardPage$().apply__Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot()
        })
      })(this$2$1)), new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$2) {
        return (function(u$2) {
          var u = $as_Ljapgolly_scalajs_react_component_Generic$UnmountedWithRoot(u$2);
          $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
          return u.vdomElement__Ljapgolly_scalajs_react_vdom_VdomElement()
        })
      })(this$2$1)))
    })
  })(this, arg1));
  var r$1 = jsx$1.$$bar__Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule__Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule($as_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule($$this.apply__O__O(a)));
  var jsx$2 = r$1.noFallback__Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules();
  var page = $m_Lcom_ouspark_dashboard_routes_AppRouter$Dashboard$();
  var method = $m_Ljapgolly_scalajs_react_extra_router_Redirect$Replace$();
  this.config$1 = jsx$2.notFound__F1__Ljapgolly_scalajs_react_extra_router_RouterConfig(arg1.$$undauto$undnotFound$undfrom$undparsed__O__F1__F1(new $c_Ljapgolly_scalajs_react_extra_router_RedirectToPage().init___O__Ljapgolly_scalajs_react_extra_router_Redirect$Method(page, method), new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$3$1, dsl$1) {
    return (function(r$2) {
      var r$3 = $as_Ljapgolly_scalajs_react_extra_router_Redirect(r$2);
      $m_s_package$();
      return new $c_s_util_Left().init___O(r$3)
    })
  })(this, arg1)))).renderWith__F2__Ljapgolly_scalajs_react_extra_router_RouterConfig(new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function(this$4$1) {
    return (function(c$2, r$3$2) {
      var c = $as_Ljapgolly_scalajs_react_extra_router_RouterCtl(c$2);
      var r$3$1 = $as_Ljapgolly_scalajs_react_extra_router_Resolution(r$3$2);
      $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
      var a$1 = this$4$1.layout__Ljapgolly_scalajs_react_extra_router_RouterCtl__Ljapgolly_scalajs_react_extra_router_Resolution__Ljapgolly_scalajs_react_vdom_TagOf(c, r$3$1);
      return a$1.render__Ljapgolly_scalajs_react_vdom_VdomElement()
    })
  })(this)));
  var this$8 = $m_Ljapgolly_scalajs_react_extra_router_BaseUrl$().fromWindowOrigin__Ljapgolly_scalajs_react_extra_router_BaseUrl();
  this.baseUrl$1 = $as_Ljapgolly_scalajs_react_extra_router_BaseUrl(this$8.endWith$und$div__Ljapgolly_scalajs_react_extra_router_PathLike().$$plus__T__Ljapgolly_scalajs_react_extra_router_PathLike("dashboard/"));
  this.router$1 = $m_Ljapgolly_scalajs_react_extra_router_Router$().apply__Ljapgolly_scalajs_react_extra_router_BaseUrl__Ljapgolly_scalajs_react_extra_router_RouterConfig__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot(this.baseUrl$1, this.config$1);
  return this
});
$c_Lcom_ouspark_dashboard_routes_AppRouter$.prototype.layout__Ljapgolly_scalajs_react_extra_router_RouterCtl__Ljapgolly_scalajs_react_extra_router_Resolution__Ljapgolly_scalajs_react_vdom_TagOf = (function(c, r) {
  var jsx$1 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$();
  var u = $m_Lcom_ouspark_dashboard_components_Navigation$().apply__Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot();
  return jsx$1.apply$extension__T__sc_Seq__Ljapgolly_scalajs_react_vdom_TagOf("div", new $c_sjs_js_WrappedArray().init___sjs_js_Array([u.vdomElement__Ljapgolly_scalajs_react_vdom_VdomElement(), $as_Ljapgolly_scalajs_react_vdom_TagMod(r.render$1.apply__O())]))
});
var $d_Lcom_ouspark_dashboard_routes_AppRouter$ = new $TypeData().initClass({
  Lcom_ouspark_dashboard_routes_AppRouter$: 0
}, false, "com.ouspark.dashboard.routes.AppRouter$", {
  Lcom_ouspark_dashboard_routes_AppRouter$: 1,
  O: 1
});
$c_Lcom_ouspark_dashboard_routes_AppRouter$.prototype.$classData = $d_Lcom_ouspark_dashboard_routes_AppRouter$;
var $n_Lcom_ouspark_dashboard_routes_AppRouter$ = (void 0);
function $m_Lcom_ouspark_dashboard_routes_AppRouter$() {
  if ((!$n_Lcom_ouspark_dashboard_routes_AppRouter$)) {
    $n_Lcom_ouspark_dashboard_routes_AppRouter$ = new $c_Lcom_ouspark_dashboard_routes_AppRouter$().init___()
  };
  return $n_Lcom_ouspark_dashboard_routes_AppRouter$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_Callback$() {
  $c_O.call(this);
  this.empty$1 = null
}
$c_Ljapgolly_scalajs_react_Callback$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_Callback$.prototype.constructor = $c_Ljapgolly_scalajs_react_Callback$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_Callback$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_Callback$.prototype = $c_Ljapgolly_scalajs_react_Callback$.prototype;
$c_Ljapgolly_scalajs_react_Callback$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_Callback$ = this;
  this.empty$1 = $m_Ljapgolly_scalajs_react_CallbackTo$().pure__O__F0((void 0));
  return this
});
$c_Ljapgolly_scalajs_react_Callback$.prototype.apply__F0__Ljapgolly_scalajs_react_Callback$ResultGuard__F0 = (function(f, evidence$2) {
  var f$2 = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, f$1) {
    return (function() {
      f$1.apply__O()
    })
  })(this, f));
  return f$2
});
var $d_Ljapgolly_scalajs_react_Callback$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_Callback$: 0
}, false, "japgolly.scalajs.react.Callback$", {
  Ljapgolly_scalajs_react_Callback$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_Callback$.prototype.$classData = $d_Ljapgolly_scalajs_react_Callback$;
var $n_Ljapgolly_scalajs_react_Callback$ = (void 0);
function $m_Ljapgolly_scalajs_react_Callback$() {
  if ((!$n_Ljapgolly_scalajs_react_Callback$)) {
    $n_Ljapgolly_scalajs_react_Callback$ = new $c_Ljapgolly_scalajs_react_Callback$().init___()
  };
  return $n_Ljapgolly_scalajs_react_Callback$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_CallbackTo() {
  $c_O.call(this);
  this.japgolly$scalajs$react$CallbackTo$$f$1 = null
}
$c_Ljapgolly_scalajs_react_CallbackTo.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_CallbackTo.prototype.constructor = $c_Ljapgolly_scalajs_react_CallbackTo;
/** @constructor */
function $h_Ljapgolly_scalajs_react_CallbackTo() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_CallbackTo.prototype = $c_Ljapgolly_scalajs_react_CallbackTo.prototype;
$c_Ljapgolly_scalajs_react_CallbackTo.prototype.init___F0 = (function(f) {
  this.japgolly$scalajs$react$CallbackTo$$f$1 = f;
  return this
});
$c_Ljapgolly_scalajs_react_CallbackTo.prototype.equals__O__Z = (function(x$1) {
  return $m_Ljapgolly_scalajs_react_CallbackTo$().equals$extension__F0__O__Z(this.japgolly$scalajs$react$CallbackTo$$f$1, x$1)
});
$c_Ljapgolly_scalajs_react_CallbackTo.prototype.hashCode__I = (function() {
  var $$this = this.japgolly$scalajs$react$CallbackTo$$f$1;
  return $systemIdentityHashCode($$this)
});
function $is_Ljapgolly_scalajs_react_CallbackTo(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_CallbackTo)))
}
function $as_Ljapgolly_scalajs_react_CallbackTo(obj) {
  return (($is_Ljapgolly_scalajs_react_CallbackTo(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.CallbackTo"))
}
function $isArrayOf_Ljapgolly_scalajs_react_CallbackTo(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_CallbackTo)))
}
function $asArrayOf_Ljapgolly_scalajs_react_CallbackTo(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_CallbackTo(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.CallbackTo;", depth))
}
var $d_Ljapgolly_scalajs_react_CallbackTo = new $TypeData().initClass({
  Ljapgolly_scalajs_react_CallbackTo: 0
}, false, "japgolly.scalajs.react.CallbackTo", {
  Ljapgolly_scalajs_react_CallbackTo: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_CallbackTo.prototype.$classData = $d_Ljapgolly_scalajs_react_CallbackTo;
/** @constructor */
function $c_Ljapgolly_scalajs_react_CallbackTo$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_CallbackTo$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_CallbackTo$.prototype.constructor = $c_Ljapgolly_scalajs_react_CallbackTo$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_CallbackTo$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_CallbackTo$.prototype = $c_Ljapgolly_scalajs_react_CallbackTo$.prototype;
$c_Ljapgolly_scalajs_react_CallbackTo$.prototype.equals$extension__F0__O__Z = (function($$this, x$1) {
  if ($is_Ljapgolly_scalajs_react_CallbackTo(x$1)) {
    var CallbackTo$1 = ((x$1 === null) ? null : $as_Ljapgolly_scalajs_react_CallbackTo(x$1).japgolly$scalajs$react$CallbackTo$$f$1);
    return ($$this === CallbackTo$1)
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_CallbackTo$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_CallbackTo$.prototype.isEmpty$und$qmark$extension__F0__Z = (function($$this) {
  return ($$this === $m_Ljapgolly_scalajs_react_Callback$().empty$1)
});
$c_Ljapgolly_scalajs_react_CallbackTo$.prototype.toJsFn$extension__F0__sjs_js_Function0 = (function($$this) {
  return (function(f) {
    return (function() {
      return f.apply__O()
    })
  })($$this)
});
$c_Ljapgolly_scalajs_react_CallbackTo$.prototype.$$greater$greater$extension__F0__F0__F0 = (function($$this, runNext) {
  return ($m_Ljapgolly_scalajs_react_CallbackTo$().isEmpty$und$qmark$extension__F0__Z($$this) ? runNext : new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, runNext$1, $$this$1) {
    return (function() {
      $$this$1.apply__O();
      return runNext$1.apply__O()
    })
  })(this, runNext, $$this)))
});
$c_Ljapgolly_scalajs_react_CallbackTo$.prototype.map$extension__F0__F1__Ljapgolly_scalajs_react_CallbackTo$MapGuard__F0 = (function($$this, g, ev) {
  return new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, $$this$1, g$1) {
    return (function() {
      return g$1.apply__O__O($$this$1.apply__O())
    })
  })(this, $$this, g))
});
$c_Ljapgolly_scalajs_react_CallbackTo$.prototype.flatMap$extension__F0__F1__F0 = (function($$this, g) {
  return new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, $$this$1, g$1) {
    return (function() {
      return $as_Ljapgolly_scalajs_react_CallbackTo(g$1.apply__O__O($$this$1.apply__O())).japgolly$scalajs$react$CallbackTo$$f$1.apply__O()
    })
  })(this, $$this, g))
});
$c_Ljapgolly_scalajs_react_CallbackTo$.prototype.pure__O__F0 = (function(a) {
  return new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, a$1) {
    return (function() {
      return a$1
    })
  })(this, a))
});
var $d_Ljapgolly_scalajs_react_CallbackTo$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_CallbackTo$: 0
}, false, "japgolly.scalajs.react.CallbackTo$", {
  Ljapgolly_scalajs_react_CallbackTo$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_CallbackTo$.prototype.$classData = $d_Ljapgolly_scalajs_react_CallbackTo$;
var $n_Ljapgolly_scalajs_react_CallbackTo$ = (void 0);
function $m_Ljapgolly_scalajs_react_CallbackTo$() {
  if ((!$n_Ljapgolly_scalajs_react_CallbackTo$)) {
    $n_Ljapgolly_scalajs_react_CallbackTo$ = new $c_Ljapgolly_scalajs_react_CallbackTo$().init___()
  };
  return $n_Ljapgolly_scalajs_react_CallbackTo$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_CtorType() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_CtorType.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_CtorType.prototype.constructor = $c_Ljapgolly_scalajs_react_CtorType;
/** @constructor */
function $h_Ljapgolly_scalajs_react_CtorType() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_CtorType.prototype = $c_Ljapgolly_scalajs_react_CtorType.prototype;
function $is_Ljapgolly_scalajs_react_CtorType(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_CtorType)))
}
function $as_Ljapgolly_scalajs_react_CtorType(obj) {
  return (($is_Ljapgolly_scalajs_react_CtorType(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.CtorType"))
}
function $isArrayOf_Ljapgolly_scalajs_react_CtorType(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_CtorType)))
}
function $asArrayOf_Ljapgolly_scalajs_react_CtorType(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_CtorType(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.CtorType;", depth))
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_CtorType$Summoner$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_CtorType$Summoner$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_CtorType$Summoner$.prototype.constructor = $c_Ljapgolly_scalajs_react_CtorType$Summoner$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_CtorType$Summoner$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_CtorType$Summoner$.prototype = $c_Ljapgolly_scalajs_react_CtorType$Summoner$.prototype;
$c_Ljapgolly_scalajs_react_CtorType$Summoner$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_CtorType$Summoner$.prototype.summonN__Ljapgolly_scalajs_react_internal_Singleton__Ljapgolly_scalajs_react_CtorType$Summoner = (function(s) {
  var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, s$1) {
    return (function(rc$2) {
      var jsx$2 = $g.React;
      var a = s$1.value$1;
      var jsx$1 = jsx$2.createElement(rc$2, a);
      return new $c_Ljapgolly_scalajs_react_CtorType$Nullary().init___O__F1__sjs_js_UndefOr(jsx$1, new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1, s$1$1, rc) {
        return (function(m$2) {
          var m = $as_Ljapgolly_scalajs_react_CtorType$Mod(m$2).mod$1;
          var jsx$3 = $g.React;
          var a$1 = $m_Ljapgolly_scalajs_react_CtorType$Mod$().apply$extension__F1__sjs_js_Object__sjs_js_Object(m, s$1$1.mutableObj$1.apply__O());
          return jsx$3.createElement(rc, a$1)
        })
      })($this, s$1, rc$2)), (void 0))
    })
  })(this, s));
  var p = $m_Ljapgolly_scalajs_react_CtorType$ProfunctorN$();
  return new $c_Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1().init___F1__Ljapgolly_scalajs_react_internal_Profunctor(f, p)
});
var $d_Ljapgolly_scalajs_react_CtorType$Summoner$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_CtorType$Summoner$: 0
}, false, "japgolly.scalajs.react.CtorType$Summoner$", {
  Ljapgolly_scalajs_react_CtorType$Summoner$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_CtorType$Summoner$.prototype.$classData = $d_Ljapgolly_scalajs_react_CtorType$Summoner$;
var $n_Ljapgolly_scalajs_react_CtorType$Summoner$ = (void 0);
function $m_Ljapgolly_scalajs_react_CtorType$Summoner$() {
  if ((!$n_Ljapgolly_scalajs_react_CtorType$Summoner$)) {
    $n_Ljapgolly_scalajs_react_CtorType$Summoner$ = new $c_Ljapgolly_scalajs_react_CtorType$Summoner$().init___()
  };
  return $n_Ljapgolly_scalajs_react_CtorType$Summoner$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_Generic$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_component_Generic$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_Generic$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_Generic$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_Generic$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_Generic$.prototype = $c_Ljapgolly_scalajs_react_component_Generic$.prototype;
$c_Ljapgolly_scalajs_react_component_Generic$.prototype.init___ = (function() {
  return this
});
var $d_Ljapgolly_scalajs_react_component_Generic$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_Generic$: 0
}, false, "japgolly.scalajs.react.component.Generic$", {
  Ljapgolly_scalajs_react_component_Generic$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_Generic$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_Generic$;
var $n_Ljapgolly_scalajs_react_component_Generic$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_Generic$() {
  if ((!$n_Ljapgolly_scalajs_react_component_Generic$)) {
    $n_Ljapgolly_scalajs_react_component_Generic$ = new $c_Ljapgolly_scalajs_react_component_Generic$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_Generic$
}
function $f_Ljapgolly_scalajs_react_component_Generic$UnmountedSimple__renderIntoDOM__Lorg_scalajs_dom_raw_Element__F0__O($thiz, container, callback) {
  return $thiz.mountRaw__F1().apply__O__O($g.ReactDOM.render($thiz.raw__Ljapgolly_scalajs_react_raw_package$ReactComponentElement(), container, $m_Ljapgolly_scalajs_react_CallbackTo$().toJsFn$extension__F0__sjs_js_Function0(callback)))
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_Scala$() {
  $c_O.call(this);
  this.builder$1 = null;
  this.Lifecycle$1 = null
}
$c_Ljapgolly_scalajs_react_component_Scala$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_Scala$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_Scala$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_Scala$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_Scala$.prototype = $c_Ljapgolly_scalajs_react_component_Scala$.prototype;
$c_Ljapgolly_scalajs_react_component_Scala$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_component_Scala$ = this;
  this.builder$1 = $m_Ljapgolly_scalajs_react_component_ScalaBuilder$EntryPoint$();
  this.Lifecycle$1 = $m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$();
  return this
});
var $d_Ljapgolly_scalajs_react_component_Scala$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_Scala$: 0
}, false, "japgolly.scalajs.react.component.Scala$", {
  Ljapgolly_scalajs_react_component_Scala$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_Scala$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_Scala$;
var $n_Ljapgolly_scalajs_react_component_Scala$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_Scala$() {
  if ((!$n_Ljapgolly_scalajs_react_component_Scala$)) {
    $n_Ljapgolly_scalajs_react_component_Scala$ = new $c_Ljapgolly_scalajs_react_component_Scala$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_Scala$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_ScalaBuilder$() {
  $c_O.call(this);
  this.japgolly$scalajs$react$component$ScalaBuilder$$InitStateUnit$1 = null
}
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_ScalaBuilder$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_ScalaBuilder$.prototype = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$.prototype;
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_component_ScalaBuilder$ = this;
  $m_s_package$();
  var value = (function() {
    $m_Ljapgolly_scalajs_react_component_ScalaBuilder$();
    return $m_Ljapgolly_scalajs_react_internal_Box$().Unit$1
  });
  this.japgolly$scalajs$react$component$ScalaBuilder$$InitStateUnit$1 = new $c_s_util_Right().init___O(value);
  return this
});
var $d_Ljapgolly_scalajs_react_component_ScalaBuilder$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_ScalaBuilder$: 0
}, false, "japgolly.scalajs.react.component.ScalaBuilder$", {
  Ljapgolly_scalajs_react_component_ScalaBuilder$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_ScalaBuilder$;
var $n_Ljapgolly_scalajs_react_component_ScalaBuilder$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_ScalaBuilder$() {
  if ((!$n_Ljapgolly_scalajs_react_component_ScalaBuilder$)) {
    $n_Ljapgolly_scalajs_react_component_ScalaBuilder$ = new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_ScalaBuilder$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_ScalaBuilder$EntryPoint$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$EntryPoint$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$EntryPoint$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$EntryPoint$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_ScalaBuilder$EntryPoint$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_ScalaBuilder$EntryPoint$.prototype = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$EntryPoint$.prototype;
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$EntryPoint$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$EntryPoint$.prototype.$static__T__Ljapgolly_scalajs_react_vdom_VdomElement__Ljapgolly_scalajs_react_component_ScalaBuilder$Step4 = (function(displayName, content) {
  $m_Ljapgolly_scalajs_react_component_ScalaBuilder$();
  var b = new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step1().init___T(displayName);
  return ($m_Ljapgolly_scalajs_react_component_ScalaBuilder$(), b.stateless__Ljapgolly_scalajs_react_component_ScalaBuilder$Step2()).noBackend__Ljapgolly_scalajs_react_component_ScalaBuilder$Step3().renderStatic__Ljapgolly_scalajs_react_vdom_VdomElement__Ljapgolly_scalajs_react_component_ScalaBuilder$Step4(content).shouldComponentUpdateConst__Z__Ljapgolly_scalajs_react_component_ScalaBuilder$Step4(false)
});
var $d_Ljapgolly_scalajs_react_component_ScalaBuilder$EntryPoint$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_ScalaBuilder$EntryPoint$: 0
}, false, "japgolly.scalajs.react.component.ScalaBuilder$EntryPoint$", {
  Ljapgolly_scalajs_react_component_ScalaBuilder$EntryPoint$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$EntryPoint$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_ScalaBuilder$EntryPoint$;
var $n_Ljapgolly_scalajs_react_component_ScalaBuilder$EntryPoint$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_ScalaBuilder$EntryPoint$() {
  if ((!$n_Ljapgolly_scalajs_react_component_ScalaBuilder$EntryPoint$)) {
    $n_Ljapgolly_scalajs_react_component_ScalaBuilder$EntryPoint$ = new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$EntryPoint$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_ScalaBuilder$EntryPoint$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount$.prototype = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount$.prototype;
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount$.prototype.equals$extension__Ljapgolly_scalajs_react_raw_package$ReactComponent__O__Z = (function($$this, x$1) {
  if ($is_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount(x$1)) {
    var ComponentDidMount$1 = ((x$1 === null) ? null : $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount(x$1).raw$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z($$this, ComponentDidMount$1)
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount$.prototype.props$extension__Ljapgolly_scalajs_react_raw_package$ReactComponent__O = (function($$this) {
  var this$1 = new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount().init___Ljapgolly_scalajs_react_raw_package$ReactComponent($$this);
  return $f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this$1).props__O()
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount$.prototype.toString$extension__Ljapgolly_scalajs_react_raw_package$ReactComponent__T = (function($$this) {
  var jsx$3 = $m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$();
  var jsx$2 = new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["ComponentDidMount(props: ", ", state: ", ")"]));
  var jsx$1 = $m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount$().props$extension__Ljapgolly_scalajs_react_raw_package$ReactComponent__O($$this);
  var this$1 = new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount().init___Ljapgolly_scalajs_react_raw_package$ReactComponent($$this);
  return jsx$3.japgolly$scalajs$react$component$ScalaBuilder$Lifecycle$$wrapTostring__T__T(jsx$2.s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$1, $f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this$1).state__O()])))
});
var $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount$: 0
}, false, "japgolly.scalajs.react.component.ScalaBuilder$Lifecycle$ComponentDidMount$", {
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount$;
var $n_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount$() {
  if ((!$n_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount$)) {
    $n_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount$ = new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount$.prototype = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount$.prototype;
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount$.prototype.equals$extension__Ljapgolly_scalajs_react_raw_package$ReactComponent__O__Z = (function($$this, x$1) {
  if ($is_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount(x$1)) {
    var ComponentWillMount$1 = ((x$1 === null) ? null : $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount(x$1).raw$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z($$this, ComponentWillMount$1)
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount$.prototype.props$extension__Ljapgolly_scalajs_react_raw_package$ReactComponent__O = (function($$this) {
  var this$1 = new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount().init___Ljapgolly_scalajs_react_raw_package$ReactComponent($$this);
  return $f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this$1).props__O()
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount$.prototype.toString$extension__Ljapgolly_scalajs_react_raw_package$ReactComponent__T = (function($$this) {
  var jsx$3 = $m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$();
  var jsx$2 = new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["ComponentWillMount(props: ", ", state: ", ")"]));
  var jsx$1 = $m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount$().props$extension__Ljapgolly_scalajs_react_raw_package$ReactComponent__O($$this);
  var this$1 = new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount().init___Ljapgolly_scalajs_react_raw_package$ReactComponent($$this);
  return jsx$3.japgolly$scalajs$react$component$ScalaBuilder$Lifecycle$$wrapTostring__T__T(jsx$2.s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$1, $f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this$1).state__O()])))
});
var $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount$: 0
}, false, "japgolly.scalajs.react.component.ScalaBuilder$Lifecycle$ComponentWillMount$", {
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount$;
var $n_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount$() {
  if ((!$n_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount$)) {
    $n_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount$ = new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount$.prototype = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount$.prototype;
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount$.prototype.equals$extension__Ljapgolly_scalajs_react_raw_package$ReactComponent__O__Z = (function($$this, x$1) {
  if ($is_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount(x$1)) {
    var ComponentWillUnmount$1 = ((x$1 === null) ? null : $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount(x$1).raw$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z($$this, ComponentWillUnmount$1)
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount$.prototype.state$extension__Ljapgolly_scalajs_react_raw_package$ReactComponent__O = (function($$this) {
  var this$1 = new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount().init___Ljapgolly_scalajs_react_raw_package$ReactComponent($$this);
  return $f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this$1).state__O()
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount$.prototype.props$extension__Ljapgolly_scalajs_react_raw_package$ReactComponent__O = (function($$this) {
  var this$1 = new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount().init___Ljapgolly_scalajs_react_raw_package$ReactComponent($$this);
  return $f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this$1).props__O()
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount$.prototype.toString$extension__Ljapgolly_scalajs_react_raw_package$ReactComponent__T = (function($$this) {
  return $m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$().japgolly$scalajs$react$component$ScalaBuilder$Lifecycle$$wrapTostring__T__T(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["ComponentWillUnmount(props: ", ", state: ", ")"])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([$m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount$().props$extension__Ljapgolly_scalajs_react_raw_package$ReactComponent__O($$this), $m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount$().state$extension__Ljapgolly_scalajs_react_raw_package$ReactComponent__O($$this)])))
});
var $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount$: 0
}, false, "japgolly.scalajs.react.component.ScalaBuilder$Lifecycle$ComponentWillUnmount$", {
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount$;
var $n_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount$() {
  if ((!$n_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount$)) {
    $n_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount$ = new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount$
}
function $f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$StateW__setState__O__F0__F0($thiz, newState, cb) {
  return $as_Ljapgolly_scalajs_react_CallbackTo($f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__mountedPure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot($thiz).setState__O__F0__O(newState, cb)).japgolly$scalajs$react$CallbackTo$$f$1
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step1() {
  $c_O.call(this);
  this.name$1 = null
}
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step1.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step1.prototype.constructor = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step1;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_ScalaBuilder$Step1() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_ScalaBuilder$Step1.prototype = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step1.prototype;
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step1.prototype.initialStateCB__F0__Ljapgolly_scalajs_react_component_ScalaBuilder$Step2 = (function(s) {
  return this.initialState__F0__Ljapgolly_scalajs_react_component_ScalaBuilder$Step2(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, s$1) {
    return (function() {
      return s$1.apply__O()
    })
  })(this, s)))
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step1.prototype.initialState__F0__Ljapgolly_scalajs_react_component_ScalaBuilder$Step2 = (function(s) {
  var jsx$1 = this.name$1;
  $m_s_package$();
  var value$1 = (function(arg$outer, s$1) {
    return (function() {
      $m_Ljapgolly_scalajs_react_internal_Box$();
      var value = s$1.apply__O();
      return {
        "a": value
      }
    })
  })(this, s);
  return new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step2().init___T__s_util_Either(jsx$1, new $c_s_util_Right().init___O(value$1))
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step1.prototype.init___T = (function(name) {
  this.name$1 = name;
  return this
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step1.prototype.stateless__Ljapgolly_scalajs_react_component_ScalaBuilder$Step2 = (function() {
  return new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step2().init___T__s_util_Either(this.name$1, $m_Ljapgolly_scalajs_react_component_ScalaBuilder$().japgolly$scalajs$react$component$ScalaBuilder$$InitStateUnit$1)
});
var $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Step1 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_ScalaBuilder$Step1: 0
}, false, "japgolly.scalajs.react.component.ScalaBuilder$Step1", {
  Ljapgolly_scalajs_react_component_ScalaBuilder$Step1: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step1.prototype.$classData = $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Step1;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step2() {
  $c_O.call(this);
  this.name$1 = null;
  this.initStateFn$1 = null
}
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step2.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step2.prototype.constructor = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step2;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_ScalaBuilder$Step2() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_ScalaBuilder$Step2.prototype = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step2.prototype;
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step2.prototype.backend__F1__Ljapgolly_scalajs_react_component_ScalaBuilder$Step3 = (function(f) {
  return new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step3().init___T__s_util_Either__F1(this.name$1, this.initStateFn$1, f)
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step2.prototype.init___T__s_util_Either = (function(name, initStateFn) {
  this.name$1 = name;
  this.initStateFn$1 = initStateFn;
  return this
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step2.prototype.noBackend__Ljapgolly_scalajs_react_component_ScalaBuilder$Step3 = (function() {
  return this.backend__F1__Ljapgolly_scalajs_react_component_ScalaBuilder$Step3(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$2$2) {
      $as_Ljapgolly_scalajs_react_component_Generic$MountedWithRoot(x$2$2)
    })
  })(this)))
});
var $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Step2 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_ScalaBuilder$Step2: 0
}, false, "japgolly.scalajs.react.component.ScalaBuilder$Step2", {
  Ljapgolly_scalajs_react_component_ScalaBuilder$Step2: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step2.prototype.$classData = $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Step2;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step3() {
  $c_O.call(this);
  this.name$1 = null;
  this.initStateFn$1 = null;
  this.backendFn$1 = null
}
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step3.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step3.prototype.constructor = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step3;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_ScalaBuilder$Step3() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_ScalaBuilder$Step3.prototype = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step3.prototype;
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step3.prototype.render$undS__F1__Ljapgolly_scalajs_react_component_ScalaBuilder$Step4 = (function(r) {
  return this.renderWith__F1__Ljapgolly_scalajs_react_component_ScalaBuilder$Step4(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, r$1) {
    return (function($$$) {
      var $$ = $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$RenderScope($$$);
      return $as_Ljapgolly_scalajs_react_vdom_VdomElement(r$1.apply__O__O($f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot($$).state__O()))
    })
  })(this, r)))
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step3.prototype.init___T__s_util_Either__F1 = (function(name, initStateFn, backendFn) {
  this.name$1 = name;
  this.initStateFn$1 = initStateFn;
  this.backendFn$1 = backendFn;
  return this
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step3.prototype.renderStatic__Ljapgolly_scalajs_react_vdom_VdomElement__Ljapgolly_scalajs_react_component_ScalaBuilder$Step4 = (function(r) {
  return this.renderWith__F1__Ljapgolly_scalajs_react_component_ScalaBuilder$Step4(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, r$1) {
    return (function(x$3$2) {
      $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$RenderScope(x$3$2);
      return r$1
    })
  })(this, r)))
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step3.prototype.renderWith__F1__Ljapgolly_scalajs_react_component_ScalaBuilder$Step4 = (function(r) {
  return new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4().init___T__s_util_Either__F1__F1__Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle(this.name$1, this.initStateFn$1, this.backendFn$1, r, new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle().init___s_Option__s_Option__s_Option__s_Option__s_Option__s_Option__s_Option($m_s_None$(), $m_s_None$(), $m_s_None$(), $m_s_None$(), $m_s_None$(), $m_s_None$(), $m_s_None$()))
});
var $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Step3 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_ScalaBuilder$Step3: 0
}, false, "japgolly.scalajs.react.component.ScalaBuilder$Step3", {
  Ljapgolly_scalajs_react_component_ScalaBuilder$Step3: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step3.prototype.$classData = $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Step3;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4() {
  $c_O.call(this);
  this.name$1 = null;
  this.initStateFn$1 = null;
  this.backendFn$1 = null;
  this.renderFn$1 = null;
  this.lifecycle$1 = null
}
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4.prototype.constructor = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4.prototype = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4.prototype;
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4.prototype.japgolly$scalajs$react$component$ScalaBuilder$Step4$$$anonfun$spec$4__Ljapgolly_scalajs_react_raw_package$ReactComponentElement__F1__Ljapgolly_scalajs_react_internal_Box = (function(rc, fn$1) {
  var js = $m_Ljapgolly_scalajs_react_component_Js$().unmounted__Ljapgolly_scalajs_react_raw_package$ReactComponentElement__Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot(rc);
  $m_Ljapgolly_scalajs_react_internal_Box$();
  var value = fn$1.apply__O__O(js.mapUnmountedProps__F1__Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$20$2) {
      return x$20$2.a
    })
  })(this))));
  return {
    "a": value
  }
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4.prototype.japgolly$scalajs$react$component$ScalaBuilder$Step4$$$anonfun$spec$7__Ljapgolly_scalajs_react_raw_package$ReactComponent__F1__F1__V = (function($$, setup$1, f$5) {
  setup$1.apply__O__O($$);
  var $$this = $as_Ljapgolly_scalajs_react_CallbackTo(f$5.apply__O__O(new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount().init___Ljapgolly_scalajs_react_raw_package$ReactComponent($$))).japgolly$scalajs$react$CallbackTo$$f$1;
  $$this.apply__O()
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4.prototype.lcAppend__p1__Ljapgolly_scalajs_react_internal_Lens__F1__F2__Ljapgolly_scalajs_react_component_ScalaBuilder$Step4 = (function(lens, g, s) {
  var x$38 = this.lifecycle$1.append__Ljapgolly_scalajs_react_internal_Lens__F1__F2__Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle(lens, g, s);
  var x$39 = this.name$1;
  var x$40 = this.initStateFn$1;
  var x$41 = this.backendFn$1;
  var x$42 = this.renderFn$1;
  return new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4().init___T__s_util_Either__F1__F1__Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle(x$39, x$40, x$41, x$42, x$38)
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4.prototype.withMounted$1__p1__F1__sjs_js_ThisFunction0 = (function(f) {
  return (function(arg$outer, f$4) {
    return (function() {
      return arg$outer.japgolly$scalajs$react$component$ScalaBuilder$Step4$$$anonfun$spec$2__Ljapgolly_scalajs_react_raw_package$ReactComponent__F1__O(this, f$4)
    })
  })(this, f)
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4.prototype.init___T__s_util_Either__F1__F1__Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle = (function(name, initStateFn, backendFn, renderFn, lifecycle) {
  this.name$1 = name;
  this.initStateFn$1 = initStateFn;
  this.backendFn$1 = backendFn;
  this.renderFn$1 = renderFn;
  this.lifecycle$1 = lifecycle;
  return this
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4.prototype.japgolly$scalajs$react$component$ScalaBuilder$Step4$$$anonfun$spec$13__Ljapgolly_scalajs_react_raw_package$ReactComponent__Ljapgolly_scalajs_react_internal_Box__Ljapgolly_scalajs_react_internal_Box__F1__V = (function($$, p, s, f$10) {
  var $$this = $as_Ljapgolly_scalajs_react_CallbackTo(f$10.apply__O__O(new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidUpdate().init___Ljapgolly_scalajs_react_raw_package$ReactComponent__O__O($$, p.a, s.a))).japgolly$scalajs$react$CallbackTo$$f$1;
  $$this.apply__O()
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4.prototype.japgolly$scalajs$react$component$ScalaBuilder$Step4$$$anonfun$spec$17__Ljapgolly_scalajs_react_raw_package$ReactComponent__Ljapgolly_scalajs_react_internal_Box__Ljapgolly_scalajs_react_internal_Box__F1__V = (function($$, p, s, f$12) {
  var $$this = $as_Ljapgolly_scalajs_react_CallbackTo(f$12.apply__O__O(new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUpdate().init___Ljapgolly_scalajs_react_raw_package$ReactComponent__O__O($$, p.a, s.a))).japgolly$scalajs$react$CallbackTo$$f$1;
  $$this.apply__O()
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4.prototype.spec__Ljapgolly_scalajs_react_raw_package$ReactComponentSpec = (function() {
  var spec = (0, $g.Object)();
  var this$1 = $m_s_Option$().apply__O__s_Option(this.name$1);
  if ((!this$1.isEmpty__Z())) {
    var arg1 = this$1.get__O();
    var n = $as_T(arg1);
    spec.displayName = n
  };
  spec.render = this.withMounted$1__p1__F1__sjs_js_ThisFunction0(this.renderFn$1.andThen__F1__F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$1) {
    return (function(x$19$2) {
      var x$19 = $as_Ljapgolly_scalajs_react_vdom_VdomElement(x$19$2);
      return x$19.rawElement$2
    })
  })(this))));
  var x1 = this.initStateFn$1;
  if ($is_s_util_Right(x1)) {
    var x2 = $as_s_util_Right(x1);
    var fn0 = x2.value$2;
    var jsx$1 = fn0
  } else if ($is_s_util_Left(x1)) {
    var x3 = $as_s_util_Left(x1);
    var fn = $as_F1(x3.value$2);
    var jsx$1 = (function(arg$outer, fn$1) {
      return (function() {
        return arg$outer.japgolly$scalajs$react$component$ScalaBuilder$Step4$$$anonfun$spec$4__Ljapgolly_scalajs_react_raw_package$ReactComponentElement__F1__Ljapgolly_scalajs_react_internal_Box(this, fn$1)
      })
    })(this, fn)
  } else {
    var jsx$1;
    throw new $c_s_MatchError().init___O(x1)
  };
  spec.getInitialState = jsx$1;
  var setup = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$3) {
    return (function($$$) {
      $m_Ljapgolly_scalajs_react_component_Js$();
      var this$5 = new $c_Ljapgolly_scalajs_react_component_Js$$anon$1().init___Ljapgolly_scalajs_react_raw_package$ReactComponent($$$);
      $m_Ljapgolly_scalajs_react_component_Scala$();
      var sMountedI = new $c_Ljapgolly_scalajs_react_component_Scala$$anon$1().init___Ljapgolly_scalajs_react_component_Js$MountedWithRoot(this$5);
      var t = $m_Ljapgolly_scalajs_react_internal_Effect$Trans$().idToCallback$1;
      var sMountedP = $as_Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(sMountedI.withEffect__Ljapgolly_scalajs_react_internal_Effect$Trans__Ljapgolly_scalajs_react_component_Generic$MountedWithRoot(t));
      var backend = this$3.backendFn$1.apply__O__O(sMountedP);
      this$5.raw$2.mountedImpure = sMountedI;
      this$5.raw$2.mountedPure = sMountedP;
      this$5.raw$2.backend = backend
    })
  })(this));
  var x1$2 = this.lifecycle$1.componentWillMount$1;
  var x = $m_s_None$();
  if ((x === x1$2)) {
    var jsx$2 = (function(f) {
      return (function() {
        return f.apply__O__O(this)
      })
    })(setup)
  } else if ($is_s_Some(x1$2)) {
    var x2$2 = $as_s_Some(x1$2);
    var f$1 = $as_F1(x2$2.value$2);
    var jsx$2 = (function(arg$outer$1, setup$1, f$5) {
      return (function() {
        arg$outer$1.japgolly$scalajs$react$component$ScalaBuilder$Step4$$$anonfun$spec$7__Ljapgolly_scalajs_react_raw_package$ReactComponent__F1__F1__V(this, setup$1, f$5)
      })
    })(this, setup, f$1)
  } else {
    var jsx$2;
    throw new $c_s_MatchError().init___O(x1$2)
  };
  spec.componentWillMount = jsx$2;
  var teardown = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$4$1) {
    return (function($$$$2) {
      $$$$2.mountedImpure = null;
      $$$$2.mountedPure = null;
      $$$$2.backend = null
    })
  })(this));
  var x1$3 = this.lifecycle$1.componentWillUnmount$1;
  var x$3 = $m_s_None$();
  if ((x$3 === x1$3)) {
    var jsx$3 = (function(f$2) {
      return (function() {
        return f$2.apply__O__O(this)
      })
    })(teardown)
  } else if ($is_s_Some(x1$3)) {
    var x2$3 = $as_s_Some(x1$3);
    var f$2$1 = $as_F1(x2$3.value$2);
    var jsx$3 = (function(arg$outer$2, teardown$1, f$6) {
      return (function() {
        arg$outer$2.japgolly$scalajs$react$component$ScalaBuilder$Step4$$$anonfun$spec$9__Ljapgolly_scalajs_react_raw_package$ReactComponent__F1__F1__V(this, teardown$1, f$6)
      })
    })(this, teardown, f$2$1)
  } else {
    var jsx$3;
    throw new $c_s_MatchError().init___O(x1$3)
  };
  spec.componentWillUnmount = jsx$3;
  var this$7 = this.lifecycle$1.componentDidMount$1;
  if ((!this$7.isEmpty__Z())) {
    var arg1$1 = this$7.get__O();
    var f$3 = $as_F1(arg1$1);
    spec.componentDidMount = (function(arg$outer$3, f$9) {
      return (function() {
        arg$outer$3.japgolly$scalajs$react$component$ScalaBuilder$Step4$$$anonfun$spec$11__Ljapgolly_scalajs_react_raw_package$ReactComponent__F1__V(this, f$9)
      })
    })(this, f$3)
  };
  var this$8 = this.lifecycle$1.componentDidUpdate$1;
  if ((!this$8.isEmpty__Z())) {
    var arg1$2 = this$8.get__O();
    var f$4 = $as_F1(arg1$2);
    spec.componentDidUpdate = (function(arg$outer$4, f$10) {
      return (function(arg1$2$1, arg2$2) {
        arg$outer$4.japgolly$scalajs$react$component$ScalaBuilder$Step4$$$anonfun$spec$13__Ljapgolly_scalajs_react_raw_package$ReactComponent__Ljapgolly_scalajs_react_internal_Box__Ljapgolly_scalajs_react_internal_Box__F1__V(this, arg1$2$1, arg2$2, f$10)
      })
    })(this, f$4)
  };
  var this$9 = this.lifecycle$1.componentWillReceiveProps$1;
  if ((!this$9.isEmpty__Z())) {
    var arg1$3 = this$9.get__O();
    var f$5$1 = $as_F1(arg1$3);
    spec.componentWillReceiveProps = (function(arg$outer$5, f$11) {
      return (function(arg1$2$2) {
        arg$outer$5.japgolly$scalajs$react$component$ScalaBuilder$Step4$$$anonfun$spec$15__Ljapgolly_scalajs_react_raw_package$ReactComponent__Ljapgolly_scalajs_react_internal_Box__F1__V(this, arg1$2$2, f$11)
      })
    })(this, f$5$1)
  };
  var this$10 = this.lifecycle$1.componentWillUpdate$1;
  if ((!this$10.isEmpty__Z())) {
    var arg1$4 = this$10.get__O();
    var f$6$1 = $as_F1(arg1$4);
    spec.componentWillUpdate = (function(arg$outer$6, f$12) {
      return (function(arg1$2$3, arg2$2$1) {
        arg$outer$6.japgolly$scalajs$react$component$ScalaBuilder$Step4$$$anonfun$spec$17__Ljapgolly_scalajs_react_raw_package$ReactComponent__Ljapgolly_scalajs_react_internal_Box__Ljapgolly_scalajs_react_internal_Box__F1__V(this, arg1$2$3, arg2$2$1, f$12)
      })
    })(this, f$6$1)
  };
  var this$11 = this.lifecycle$1.shouldComponentUpdate$1;
  if ((!this$11.isEmpty__Z())) {
    var arg1$5 = this$11.get__O();
    var f$7 = $as_F1(arg1$5);
    spec.shouldComponentUpdate = (function(arg$outer$7, f$13) {
      return (function(arg1$2$4, arg2$2$2) {
        return arg$outer$7.japgolly$scalajs$react$component$ScalaBuilder$Step4$$$anonfun$spec$19__Ljapgolly_scalajs_react_raw_package$ReactComponent__Ljapgolly_scalajs_react_internal_Box__Ljapgolly_scalajs_react_internal_Box__F1__Z(this, arg1$2$4, arg2$2$2, f$13)
      })
    })(this, f$7)
  };
  return spec
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4.prototype.japgolly$scalajs$react$component$ScalaBuilder$Step4$$$anonfun$spec$9__Ljapgolly_scalajs_react_raw_package$ReactComponent__F1__F1__V = (function($$, teardown$1, f$6) {
  var $$this = $as_Ljapgolly_scalajs_react_CallbackTo(f$6.apply__O__O(new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount().init___Ljapgolly_scalajs_react_raw_package$ReactComponent($$))).japgolly$scalajs$react$CallbackTo$$f$1;
  $$this.apply__O();
  teardown$1.apply__O__O($$)
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4.prototype.shouldComponentUpdateConst__F0__Ljapgolly_scalajs_react_component_ScalaBuilder$Step4 = (function(cb) {
  var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, cb$1) {
    return (function(x$18$2) {
      $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ShouldComponentUpdate(x$18$2);
      return new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0(cb$1)
    })
  })(this, cb));
  return this.lcAppend__p1__Ljapgolly_scalajs_react_internal_Lens__F1__F2__Ljapgolly_scalajs_react_component_ScalaBuilder$Step4($m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$().shouldComponentUpdate__Ljapgolly_scalajs_react_internal_Lens(), f, $m_Ljapgolly_scalajs_react_internal_Semigroup$().eitherCB$1)
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4.prototype.japgolly$scalajs$react$component$ScalaBuilder$Step4$$$anonfun$spec$15__Ljapgolly_scalajs_react_raw_package$ReactComponent__Ljapgolly_scalajs_react_internal_Box__F1__V = (function($$, p, f$11) {
  var $$this = $as_Ljapgolly_scalajs_react_CallbackTo(f$11.apply__O__O(new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillReceiveProps().init___Ljapgolly_scalajs_react_raw_package$ReactComponent__O($$, p.a))).japgolly$scalajs$react$CallbackTo$$f$1;
  $$this.apply__O()
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4.prototype.build__Ljapgolly_scalajs_react_CtorType$Summoner__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot = (function(ctorType) {
  var rc = $g.React.createClass(this.spec__Ljapgolly_scalajs_react_raw_package$ReactComponentSpec());
  $m_Ljapgolly_scalajs_react_component_Js$();
  var x = $m_Ljapgolly_scalajs_react_component_Js$().component__sjs_js_Function1__Ljapgolly_scalajs_react_CtorType$Summoner__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot(rc, ctorType);
  return x.cmapCtorProps__F1__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$21$2) {
      $m_Ljapgolly_scalajs_react_internal_Box$();
      return {
        "a": x$21$2
      }
    })
  })(this))).mapUnmounted__F1__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$1) {
    return (function(x$22$2) {
      var x$22 = $as_Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot(x$22$2);
      return x$22.mapUnmountedProps__F1__Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1) {
        return (function(x$23$2) {
          return x$23$2.a
        })
      })(this$2$1))).mapMounted__F1__Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$2) {
        return (function(x$2) {
          var x$1 = $as_Ljapgolly_scalajs_react_component_Js$MountedWithRoot(x$2);
          $m_Ljapgolly_scalajs_react_component_Scala$();
          return new $c_Ljapgolly_scalajs_react_component_Scala$$anon$1().init___Ljapgolly_scalajs_react_component_Js$MountedWithRoot(x$1)
        })
      })(this$2$1)))
    })
  })(this)))
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4.prototype.japgolly$scalajs$react$component$ScalaBuilder$Step4$$$anonfun$spec$2__Ljapgolly_scalajs_react_raw_package$ReactComponent__F1__O = (function($$, f$4) {
  return f$4.apply__O__O(new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$RenderScope().init___Ljapgolly_scalajs_react_raw_package$ReactComponent($$))
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4.prototype.japgolly$scalajs$react$component$ScalaBuilder$Step4$$$anonfun$spec$19__Ljapgolly_scalajs_react_raw_package$ReactComponent__Ljapgolly_scalajs_react_internal_Box__Ljapgolly_scalajs_react_internal_Box__F1__Z = (function($$, p, s, f$13) {
  var $$this = $as_Ljapgolly_scalajs_react_CallbackTo(f$13.apply__O__O(new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ShouldComponentUpdate().init___Ljapgolly_scalajs_react_raw_package$ReactComponent__O__O($$, p.a, s.a))).japgolly$scalajs$react$CallbackTo$$f$1;
  return $uZ($$this.apply__O())
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4.prototype.japgolly$scalajs$react$component$ScalaBuilder$Step4$$$anonfun$spec$11__Ljapgolly_scalajs_react_raw_package$ReactComponent__F1__V = (function($$, f$9) {
  var $$this = $as_Ljapgolly_scalajs_react_CallbackTo(f$9.apply__O__O(new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount().init___Ljapgolly_scalajs_react_raw_package$ReactComponent($$))).japgolly$scalajs$react$CallbackTo$$f$1;
  $$this.apply__O()
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4.prototype.shouldComponentUpdateConst__Z__Ljapgolly_scalajs_react_component_ScalaBuilder$Step4 = (function(b) {
  return this.shouldComponentUpdateConst__F0__Ljapgolly_scalajs_react_component_ScalaBuilder$Step4($m_Ljapgolly_scalajs_react_CallbackTo$().pure__O__F0(b))
});
function $is_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_component_ScalaBuilder$Step4)))
}
function $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4(obj) {
  return (($is_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.component.ScalaBuilder$Step4"))
}
function $isArrayOf_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_component_ScalaBuilder$Step4)))
}
function $asArrayOf_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.component.ScalaBuilder$Step4;", depth))
}
var $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_ScalaBuilder$Step4: 0
}, false, "japgolly.scalajs.react.component.ScalaBuilder$Step4", {
  Ljapgolly_scalajs_react_component_ScalaBuilder$Step4: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4.prototype.$classData = $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_ScalaFn$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_component_ScalaFn$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_ScalaFn$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_ScalaFn$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_ScalaFn$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_ScalaFn$.prototype = $c_Ljapgolly_scalajs_react_component_ScalaFn$.prototype;
$c_Ljapgolly_scalajs_react_component_ScalaFn$.prototype.init___ = (function() {
  return this
});
var $d_Ljapgolly_scalajs_react_component_ScalaFn$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_ScalaFn$: 0
}, false, "japgolly.scalajs.react.component.ScalaFn$", {
  Ljapgolly_scalajs_react_component_ScalaFn$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_component_ScalaFn$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_ScalaFn$;
var $n_Ljapgolly_scalajs_react_component_ScalaFn$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_ScalaFn$() {
  if ((!$n_Ljapgolly_scalajs_react_component_ScalaFn$)) {
    $n_Ljapgolly_scalajs_react_component_ScalaFn$ = new $c_Ljapgolly_scalajs_react_component_ScalaFn$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_ScalaFn$
}
function $f_Ljapgolly_scalajs_react_extra_Broadcaster__register__F1__F0($thiz, f) {
  var f$2 = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, f$1) {
    return (function() {
      var this$1 = $this.japgolly$scalajs$react$extra$Broadcaster$$$undlisteners$1;
      $this.japgolly$scalajs$react$extra$Broadcaster$$$undlisteners$1 = new $c_sci_$colon$colon().init___O__sci_List(f$1, this$1);
      return new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0($m_Ljapgolly_scalajs_react_Callback$().apply__F0__Ljapgolly_scalajs_react_Callback$ResultGuard__F0(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this$1, f$1$1) {
        return (function() {
          var this$2 = $this$1.japgolly$scalajs$react$extra$Broadcaster$$$undlisteners$1;
          $m_sci_List$();
          var b = new $c_scm_ListBuffer().init___();
          var these = this$2;
          while ((!these.isEmpty__Z())) {
            var arg1 = these.head__O();
            var x$1 = $as_F1(arg1);
            if (((x$1 !== f$1$1) !== false)) {
              b.$$plus$eq__O__scm_ListBuffer(arg1)
            };
            var this$4 = these;
            these = this$4.tail__sci_List()
          };
          $this$1.japgolly$scalajs$react$extra$Broadcaster$$$undlisteners$1 = b.toList__sci_List()
        })
      })($this, f$1)), null))
    })
  })($thiz, f));
  return f$2
}
function $f_Ljapgolly_scalajs_react_extra_Broadcaster__broadcast__O__F0($thiz, a) {
  return $m_Ljapgolly_scalajs_react_Callback$().apply__F0__Ljapgolly_scalajs_react_Callback$ResultGuard__F0(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, a$1) {
    return (function() {
      var this$1 = $this.japgolly$scalajs$react$extra$Broadcaster$$$undlisteners$1;
      var these = this$1;
      while ((!these.isEmpty__Z())) {
        var arg1 = these.head__O();
        var x$2 = $as_F1(arg1);
        var $$this = $as_Ljapgolly_scalajs_react_CallbackTo(x$2.apply__O__O(a$1)).japgolly$scalajs$react$CallbackTo$$f$1;
        $$this.apply__O();
        var this$3 = these;
        these = this$3.tail__sci_List()
      }
    })
  })($thiz, a)), null)
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_EventListener$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_extra_EventListener$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_EventListener$.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_EventListener$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_EventListener$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_EventListener$.prototype = $c_Ljapgolly_scalajs_react_extra_EventListener$.prototype;
$c_Ljapgolly_scalajs_react_extra_EventListener$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_extra_EventListener$.prototype.install__T__F1__F1__Z__F1 = (function(eventType, listener, target, useCapture) {
  return $m_Ljapgolly_scalajs_react_extra_EventListener$OfEventType$().install$extension__Z__T__F1__F1__Z__F1(true, eventType, new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, listener$1) {
    return (function($$$) {
      var $$ = $as_Ljapgolly_scalajs_react_component_Scala$MountedWithRoot($$$);
      var cb = $as_Ljapgolly_scalajs_react_CallbackTo(listener$1.apply__O__O($$)).japgolly$scalajs$react$CallbackTo$$f$1;
      return new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1, cb$1) {
        return (function(x$3$2) {
          return new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0(cb$1)
        })
      })($this, cb))
    })
  })(this, listener)), target, useCapture)
});
var $d_Ljapgolly_scalajs_react_extra_EventListener$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_EventListener$: 0
}, false, "japgolly.scalajs.react.extra.EventListener$", {
  Ljapgolly_scalajs_react_extra_EventListener$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_extra_EventListener$.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_EventListener$;
var $n_Ljapgolly_scalajs_react_extra_EventListener$ = (void 0);
function $m_Ljapgolly_scalajs_react_extra_EventListener$() {
  if ((!$n_Ljapgolly_scalajs_react_extra_EventListener$)) {
    $n_Ljapgolly_scalajs_react_extra_EventListener$ = new $c_Ljapgolly_scalajs_react_extra_EventListener$().init___()
  };
  return $n_Ljapgolly_scalajs_react_extra_EventListener$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_EventListener$OfEventType$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_extra_EventListener$OfEventType$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_EventListener$OfEventType$.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_EventListener$OfEventType$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_EventListener$OfEventType$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_EventListener$OfEventType$.prototype = $c_Ljapgolly_scalajs_react_extra_EventListener$OfEventType$.prototype;
$c_Ljapgolly_scalajs_react_extra_EventListener$OfEventType$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_extra_EventListener$OfEventType$.prototype.japgolly$scalajs$react$extra$EventListener$OfEventType$$$anonfun$install$3__Lorg_scalajs_dom_raw_Event__F1__V = (function(e, fe$1) {
  var $$this = $as_Ljapgolly_scalajs_react_CallbackTo(fe$1.apply__O__O(e)).japgolly$scalajs$react$CallbackTo$$f$1;
  $$this.apply__O()
});
$c_Ljapgolly_scalajs_react_extra_EventListener$OfEventType$.prototype.install$extension__Z__T__F1__F1__Z__F1 = (function($$this, eventType, listener, target, useCapture) {
  return $m_Ljapgolly_scalajs_react_extra_OnUnmount$().install__F1().andThen__F1__F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, eventType$1, listener$1, target$1, useCapture$1) {
    return (function(x$2$2) {
      var x$2 = $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4(x$2$2);
      var f$3 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1, eventType$1$1, listener$2, target$1$1, useCapture$1$1) {
        return (function($$$) {
          var $$ = $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount($$$).raw$1;
          var this$1 = new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount().init___Ljapgolly_scalajs_react_raw_package$ReactComponent($$);
          var et = target$1$1.apply__O__O($f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this$1));
          var this$2 = new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount().init___Ljapgolly_scalajs_react_raw_package$ReactComponent($$);
          var fe = $as_F1(listener$2.apply__O__O($f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__mountedPure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this$2)));
          var f = (function(fe$1) {
            return (function(arg1$2) {
              $m_Ljapgolly_scalajs_react_extra_EventListener$OfEventType$().japgolly$scalajs$react$extra$EventListener$OfEventType$$$anonfun$install$3__Lorg_scalajs_dom_raw_Event__F1__V(arg1$2, fe$1)
            })
          })(fe);
          var add = $m_Ljapgolly_scalajs_react_Callback$().apply__F0__Ljapgolly_scalajs_react_Callback$ResultGuard__F0(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this$2, et$1, f$1, eventType$1$2, useCapture$1$2) {
            return (function() {
              et$1.addEventListener(eventType$1$2, f$1, useCapture$1$2)
            })
          })($this$1, et, f, eventType$1$1, useCapture$1$1)), null);
          var del = $m_Ljapgolly_scalajs_react_Callback$().apply__F0__Ljapgolly_scalajs_react_Callback$ResultGuard__F0(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2$1, et$2, f$2, eventType$1$3, useCapture$1$3) {
            return (function() {
              et$2.removeEventListener(eventType$1$3, f$2, useCapture$1$3)
            })
          })($this$1, et, f, eventType$1$1, useCapture$1$1)), null);
          var jsx$1 = $m_Ljapgolly_scalajs_react_CallbackTo$();
          var this$3 = new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount().init___Ljapgolly_scalajs_react_raw_package$ReactComponent($$);
          var this$4 = $as_Ljapgolly_scalajs_react_extra_OnUnmount($f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__backend__O(this$3));
          return new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0(jsx$1.$$greater$greater$extension__F0__F0__F0(add, $f_Ljapgolly_scalajs_react_extra_OnUnmount__onUnmount__F0__F0(this$4, del)))
        })
      })($this, eventType$1, listener$1, target$1, useCapture$1));
      return x$2.lcAppend__p1__Ljapgolly_scalajs_react_internal_Lens__F1__F2__Ljapgolly_scalajs_react_component_ScalaBuilder$Step4($m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$().componentDidMount__Ljapgolly_scalajs_react_internal_Lens(), f$3, $m_Ljapgolly_scalajs_react_internal_Semigroup$().callback$1)
    })
  })(this, eventType, listener, target, useCapture)))
});
var $d_Ljapgolly_scalajs_react_extra_EventListener$OfEventType$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_EventListener$OfEventType$: 0
}, false, "japgolly.scalajs.react.extra.EventListener$OfEventType$", {
  Ljapgolly_scalajs_react_extra_EventListener$OfEventType$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_extra_EventListener$OfEventType$.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_EventListener$OfEventType$;
var $n_Ljapgolly_scalajs_react_extra_EventListener$OfEventType$ = (void 0);
function $m_Ljapgolly_scalajs_react_extra_EventListener$OfEventType$() {
  if ((!$n_Ljapgolly_scalajs_react_extra_EventListener$OfEventType$)) {
    $n_Ljapgolly_scalajs_react_extra_EventListener$OfEventType$ = new $c_Ljapgolly_scalajs_react_extra_EventListener$OfEventType$().init___()
  };
  return $n_Ljapgolly_scalajs_react_extra_EventListener$OfEventType$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_Listenable$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_extra_Listenable$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_Listenable$.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_Listenable$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_Listenable$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_Listenable$.prototype = $c_Ljapgolly_scalajs_react_extra_Listenable$.prototype;
$c_Ljapgolly_scalajs_react_extra_Listenable$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_extra_Listenable$.prototype.listenToUnit__F1__F1__F1 = (function(listenable, makeListener) {
  return this.listen__F1__F1__F1(listenable, new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, makeListener$1) {
    return (function($$$) {
      var $$ = $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount($$$).raw$1;
      return new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1, makeListener$2, $$$1) {
        return (function(x$2$2) {
          $asUnit(x$2$2);
          return new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0($as_Ljapgolly_scalajs_react_CallbackTo(makeListener$2.apply__O__O(new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount().init___Ljapgolly_scalajs_react_raw_package$ReactComponent($$$1))).japgolly$scalajs$react$CallbackTo$$f$1)
        })
      })($this, makeListener$1, $$))
    })
  })(this, makeListener)))
});
$c_Ljapgolly_scalajs_react_extra_Listenable$.prototype.listen__F1__F1__F1 = (function(listenable, makeListener) {
  return $m_Ljapgolly_scalajs_react_extra_OnUnmount$().install__F1().andThen__F1__F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, listenable$1, makeListener$1) {
    return (function(x$1$2) {
      var x$1 = $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4(x$1$2);
      var f$3 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1, listenable$1$1, makeListener$1$1) {
        return (function($$$) {
          var $$ = $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount($$$).raw$1;
          var this$1 = $as_Ljapgolly_scalajs_react_extra_Listenable(listenable$1$1.apply__O__O($m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount$().props$extension__Ljapgolly_scalajs_react_raw_package$ReactComponent__O($$)));
          var f = $as_F1(makeListener$1$1.apply__O__O(new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount().init___Ljapgolly_scalajs_react_raw_package$ReactComponent($$)));
          var $$this = $f_Ljapgolly_scalajs_react_extra_Broadcaster__register__F1__F0(this$1, f);
          var this$2 = new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount().init___Ljapgolly_scalajs_react_raw_package$ReactComponent($$);
          var eta$0$1 = $as_Ljapgolly_scalajs_react_extra_OnUnmount($f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__backend__O(this$2));
          var g = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$2, eta$0$1$1) {
            return (function(f$2) {
              var f$1 = $as_Ljapgolly_scalajs_react_CallbackTo(f$2).japgolly$scalajs$react$CallbackTo$$f$1;
              return new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0($f_Ljapgolly_scalajs_react_extra_OnUnmount__onUnmount__F0__F0(eta$0$1$1, f$1))
            })
          })($this$1, eta$0$1));
          return new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0($m_Ljapgolly_scalajs_react_CallbackTo$().flatMap$extension__F0__F1__F0($$this, g))
        })
      })($this, listenable$1, makeListener$1));
      return x$1.lcAppend__p1__Ljapgolly_scalajs_react_internal_Lens__F1__F2__Ljapgolly_scalajs_react_component_ScalaBuilder$Step4($m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$().componentDidMount__Ljapgolly_scalajs_react_internal_Lens(), f$3, $m_Ljapgolly_scalajs_react_internal_Semigroup$().callback$1)
    })
  })(this, listenable, makeListener)))
});
var $d_Ljapgolly_scalajs_react_extra_Listenable$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_Listenable$: 0
}, false, "japgolly.scalajs.react.extra.Listenable$", {
  Ljapgolly_scalajs_react_extra_Listenable$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_extra_Listenable$.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_Listenable$;
var $n_Ljapgolly_scalajs_react_extra_Listenable$ = (void 0);
function $m_Ljapgolly_scalajs_react_extra_Listenable$() {
  if ((!$n_Ljapgolly_scalajs_react_extra_Listenable$)) {
    $n_Ljapgolly_scalajs_react_extra_Listenable$ = new $c_Ljapgolly_scalajs_react_extra_Listenable$().init___()
  };
  return $n_Ljapgolly_scalajs_react_extra_Listenable$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_OnUnmount$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_extra_OnUnmount$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_OnUnmount$.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_OnUnmount$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_OnUnmount$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_OnUnmount$.prototype = $c_Ljapgolly_scalajs_react_extra_OnUnmount$.prototype;
$c_Ljapgolly_scalajs_react_extra_OnUnmount$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_extra_OnUnmount$.prototype.install__F1 = (function() {
  return new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$2$2) {
      var x$2 = $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4(x$2$2);
      var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1) {
        return (function(x$3$2) {
          var x$3 = $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount(x$3$2).raw$1;
          var this$1 = new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount().init___Ljapgolly_scalajs_react_raw_package$ReactComponent(x$3);
          var this$2 = $as_Ljapgolly_scalajs_react_extra_OnUnmount($f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__backend__O(this$1));
          return new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0($f_Ljapgolly_scalajs_react_extra_OnUnmount__unmount__F0(this$2))
        })
      })($this));
      return x$2.lcAppend__p1__Ljapgolly_scalajs_react_internal_Lens__F1__F2__Ljapgolly_scalajs_react_component_ScalaBuilder$Step4($m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$().componentWillUnmount__Ljapgolly_scalajs_react_internal_Lens(), f, $m_Ljapgolly_scalajs_react_internal_Semigroup$().callback$1)
    })
  })(this))
});
var $d_Ljapgolly_scalajs_react_extra_OnUnmount$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_OnUnmount$: 0
}, false, "japgolly.scalajs.react.extra.OnUnmount$", {
  Ljapgolly_scalajs_react_extra_OnUnmount$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_extra_OnUnmount$.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_OnUnmount$;
var $n_Ljapgolly_scalajs_react_extra_OnUnmount$ = (void 0);
function $m_Ljapgolly_scalajs_react_extra_OnUnmount$() {
  if ((!$n_Ljapgolly_scalajs_react_extra_OnUnmount$)) {
    $n_Ljapgolly_scalajs_react_extra_OnUnmount$ = new $c_Ljapgolly_scalajs_react_extra_OnUnmount$().init___()
  };
  return $n_Ljapgolly_scalajs_react_extra_OnUnmount$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_PathLike() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_extra_router_PathLike.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_router_PathLike.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_PathLike;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_PathLike() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_PathLike.prototype = $c_Ljapgolly_scalajs_react_extra_router_PathLike.prototype;
$c_Ljapgolly_scalajs_react_extra_router_PathLike.prototype.endWith$und$div__Ljapgolly_scalajs_react_extra_router_PathLike = (function() {
  var arg1 = this.str__Ljapgolly_scalajs_react_extra_router_PathLike__T(this);
  return this.make__T__Ljapgolly_scalajs_react_extra_router_PathLike($m_sjsr_RuntimeString$().replaceFirst__T__T__T__T(arg1, "/*$", "/"))
});
$c_Ljapgolly_scalajs_react_extra_router_PathLike.prototype.$$plus__T__Ljapgolly_scalajs_react_extra_router_PathLike = (function(p) {
  var arg1 = this.str__Ljapgolly_scalajs_react_extra_router_PathLike__T(this);
  return this.make__T__Ljapgolly_scalajs_react_extra_router_PathLike((("" + arg1) + p))
});
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_RouteCmd() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_RouteCmd;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_RouteCmd() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_RouteCmd.prototype = $c_Ljapgolly_scalajs_react_extra_router_RouteCmd.prototype;
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd.prototype.$$greater$greater__Ljapgolly_scalajs_react_extra_router_RouteCmd__Ljapgolly_scalajs_react_extra_router_RouteCmd = (function(next) {
  if ($is_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence(this)) {
    var x2 = $as_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence(this);
    var x = x2.init$2;
    var y = x2.last$2;
    var init = $as_sci_Vector(x.$$colon$plus__O__scg_CanBuildFrom__O(y, ($m_sci_Vector$(), $m_sc_IndexedSeq$().ReusableCBF$6)))
  } else {
    var this$2 = $m_s_package$().Vector$1;
    var init = $as_sci_Vector(this$2.NIL$6.$$colon$plus__O__scg_CanBuildFrom__O(this, ($m_sci_Vector$(), $m_sc_IndexedSeq$().ReusableCBF$6)))
  };
  return new $c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence().init___sci_Vector__Ljapgolly_scalajs_react_extra_router_RouteCmd(init, next)
});
function $is_Ljapgolly_scalajs_react_extra_router_RouteCmd(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_extra_router_RouteCmd)))
}
function $as_Ljapgolly_scalajs_react_extra_router_RouteCmd(obj) {
  return (($is_Ljapgolly_scalajs_react_extra_router_RouteCmd(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.extra.router.RouteCmd"))
}
function $isArrayOf_Ljapgolly_scalajs_react_extra_router_RouteCmd(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_extra_router_RouteCmd)))
}
function $asArrayOf_Ljapgolly_scalajs_react_extra_router_RouteCmd(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_extra_router_RouteCmd(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.extra.router.RouteCmd;", depth))
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_Router$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_extra_router_Router$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_router_Router$.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_Router$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_Router$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_Router$.prototype = $c_Ljapgolly_scalajs_react_extra_router_Router$.prototype;
$c_Ljapgolly_scalajs_react_extra_router_Router$.prototype.apply__Ljapgolly_scalajs_react_extra_router_BaseUrl__Ljapgolly_scalajs_react_extra_router_RouterConfig__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot = (function(baseUrl, cfg) {
  return this.componentUnbuilt__Ljapgolly_scalajs_react_extra_router_BaseUrl__Ljapgolly_scalajs_react_extra_router_RouterConfig__Ljapgolly_scalajs_react_component_ScalaBuilder$Step4(baseUrl, cfg).build__Ljapgolly_scalajs_react_CtorType$Summoner__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot($m_Ljapgolly_scalajs_react_CtorType$Summoner$().summonN__Ljapgolly_scalajs_react_internal_Singleton__Ljapgolly_scalajs_react_CtorType$Summoner($m_Ljapgolly_scalajs_react_internal_Singleton$().BoxUnit$1))
});
$c_Ljapgolly_scalajs_react_extra_router_Router$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_Router$.prototype.componentUnbuiltC__Ljapgolly_scalajs_react_extra_router_BaseUrl__Ljapgolly_scalajs_react_extra_router_RouterConfig__Ljapgolly_scalajs_react_extra_router_RouterLogic__Ljapgolly_scalajs_react_component_ScalaBuilder$Step4 = (function(baseUrl, cfg, lgc) {
  var this$5 = ($m_Ljapgolly_scalajs_react_package$(), new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Step1().init___T("Router")).initialStateCB__F0__Ljapgolly_scalajs_react_component_ScalaBuilder$Step2(lgc.syncToWindowUrl$1).backend__F1__Ljapgolly_scalajs_react_component_ScalaBuilder$Step3(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$1$2) {
      $as_Ljapgolly_scalajs_react_component_Generic$MountedWithRoot(x$1$2);
      return new $c_Ljapgolly_scalajs_react_extra_OnUnmount$Backend().init___()
    })
  })(this))).render$undS__F1__Ljapgolly_scalajs_react_component_ScalaBuilder$Step4(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2, lgc$1) {
    return (function(r$2) {
      var r = $as_Ljapgolly_scalajs_react_extra_router_Resolution(r$2);
      return lgc$1.render__Ljapgolly_scalajs_react_extra_router_Resolution__Ljapgolly_scalajs_react_vdom_VdomElement(r)
    })
  })(this, lgc)));
  var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$3, cfg$1) {
    return (function($$$) {
      var $$ = $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount($$$).raw$1;
      var jsx$2 = cfg$1.postRenderFn$1;
      var jsx$1 = $m_s_None$();
      var this$4 = new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount().init___Ljapgolly_scalajs_react_raw_package$ReactComponent($$);
      return new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0($as_Ljapgolly_scalajs_react_CallbackTo(jsx$2.apply__O__O__O(jsx$1, $as_Ljapgolly_scalajs_react_extra_router_Resolution($f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this$4).state__O()).page$1)).japgolly$scalajs$react$CallbackTo$$f$1)
    })
  })(this, cfg));
  var this$6 = this$5.lcAppend__p1__Ljapgolly_scalajs_react_internal_Lens__F1__F2__Ljapgolly_scalajs_react_component_ScalaBuilder$Step4($m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$().componentDidMount__Ljapgolly_scalajs_react_internal_Lens(), f, $m_Ljapgolly_scalajs_react_internal_Semigroup$().callback$1);
  var f$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$4$1, cfg$2) {
    return (function(i$2) {
      var i = $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidUpdate(i$2);
      return new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0($as_Ljapgolly_scalajs_react_CallbackTo(cfg$2.postRenderFn$1.apply__O__O__O(new $c_s_Some().init___O($as_Ljapgolly_scalajs_react_extra_router_Resolution(i.prevState$1).page$1), $as_Ljapgolly_scalajs_react_extra_router_Resolution($f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(i).state__O()).page$1)).japgolly$scalajs$react$CallbackTo$$f$1)
    })
  })(this, cfg));
  var this$11 = this$6.lcAppend__p1__Ljapgolly_scalajs_react_internal_Lens__F1__F2__Ljapgolly_scalajs_react_component_ScalaBuilder$Step4($m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$().componentDidUpdate__Ljapgolly_scalajs_react_internal_Lens(), f$1, $m_Ljapgolly_scalajs_react_internal_Semigroup$().callback$1);
  var array = [$m_Ljapgolly_scalajs_react_extra_EventListener$().install__T__F1__F1__Z__F1("popstate", new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$5$1, lgc$2) {
    return (function(x$2$2) {
      $as_Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(x$2$2);
      return new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0(lgc$2.ctl$1.refresh__F0())
    })
  })(this, lgc)), new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$6$1) {
    return (function(x$3$2) {
      $as_Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(x$3$2);
      return $m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window()
    })
  })(this)), false), $m_Ljapgolly_scalajs_react_extra_Listenable$().listenToUnit__F1__F1__F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$7, lgc$3) {
    return (function(x$4$2) {
      $asUnit(x$4$2);
      return lgc$3
    })
  })(this, lgc)), new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$8, lgc$4) {
    return (function($$$$2) {
      var $$$2 = $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount($$$$2).raw$1;
      return new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0($m_Ljapgolly_scalajs_react_CallbackTo$().flatMap$extension__F0__F1__F0(lgc$4.syncToWindowUrl$1, new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1, $$$1) {
        return (function(x$5$2) {
          var x$5 = $as_Ljapgolly_scalajs_react_extra_router_Resolution(x$5$2);
          var this$10 = new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount().init___Ljapgolly_scalajs_react_raw_package$ReactComponent($$$1);
          new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount().init___Ljapgolly_scalajs_react_raw_package$ReactComponent($$$1);
          var cb = $m_Ljapgolly_scalajs_react_Callback$().empty$1;
          return new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0($f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$StateW__setState__O__F0__F0(this$10, x$5, cb))
        })
      })(this$8, $$$2))))
    })
  })(this, lgc)))];
  var start = 0;
  var end = $uI(array.length);
  var z = this$11;
  var start$1 = start;
  var z$1 = z;
  var jsx$3;
  _foldl: while (true) {
    if ((start$1 !== end)) {
      var temp$start = ((1 + start$1) | 0);
      var arg1 = z$1;
      var index = start$1;
      var arg2 = array[index];
      var s = $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4(arg1);
      var f$2 = $as_F1(arg2);
      var temp$z = $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4(f$2.apply__O__O(s));
      start$1 = temp$start;
      z$1 = temp$z;
      continue _foldl
    };
    var jsx$3 = z$1;
    break
  };
  return $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Step4(jsx$3)
});
$c_Ljapgolly_scalajs_react_extra_router_Router$.prototype.componentUnbuilt__Ljapgolly_scalajs_react_extra_router_BaseUrl__Ljapgolly_scalajs_react_extra_router_RouterConfig__Ljapgolly_scalajs_react_component_ScalaBuilder$Step4 = (function(baseUrl, cfg) {
  return this.componentUnbuiltC__Ljapgolly_scalajs_react_extra_router_BaseUrl__Ljapgolly_scalajs_react_extra_router_RouterConfig__Ljapgolly_scalajs_react_extra_router_RouterLogic__Ljapgolly_scalajs_react_component_ScalaBuilder$Step4(baseUrl, cfg, new $c_Ljapgolly_scalajs_react_extra_router_RouterLogic().init___Ljapgolly_scalajs_react_extra_router_BaseUrl__Ljapgolly_scalajs_react_extra_router_RouterConfig(baseUrl, cfg))
});
var $d_Ljapgolly_scalajs_react_extra_router_Router$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_Router$: 0
}, false, "japgolly.scalajs.react.extra.router.Router$", {
  Ljapgolly_scalajs_react_extra_router_Router$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_extra_router_Router$.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_Router$;
var $n_Ljapgolly_scalajs_react_extra_router_Router$ = (void 0);
function $m_Ljapgolly_scalajs_react_extra_router_Router$() {
  if ((!$n_Ljapgolly_scalajs_react_extra_router_Router$)) {
    $n_Ljapgolly_scalajs_react_extra_router_Router$ = new $c_Ljapgolly_scalajs_react_extra_router_Router$().init___()
  };
  return $n_Ljapgolly_scalajs_react_extra_router_Router$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl() {
  $c_O.call(this);
  this.int$1 = null;
  this.long$1 = null;
  this.uuid$1 = null
}
$c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl.prototype = $c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl.prototype;
$c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl.prototype.dynamicRouteF__Ljapgolly_scalajs_react_extra_router_StaticDsl$Route__F1__F1 = (function(r, op) {
  return new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, r$1, op$1) {
    return (function(a$2) {
      var a = $as_F1(a$2);
      var parse = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1, r$1$1) {
        return (function(path$2) {
          var path = $as_Ljapgolly_scalajs_react_extra_router_Path(path$2);
          var o = r$1$1.parse__Ljapgolly_scalajs_react_extra_router_Path__s_Option(path);
          if (o.isEmpty__Z()) {
            return $m_s_None$()
          } else {
            var arg1 = o.get__O();
            $m_s_package$();
            return new $c_s_Some().init___O(new $c_s_util_Right().init___O(arg1))
          }
        })
      })($this, r$1));
      var eta$0$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2, r$1$2) {
        return (function(a$2$2) {
          return r$1$2.pathFor__O__Ljapgolly_scalajs_react_extra_router_Path(a$2$2)
        })
      })($this, r$1));
      var path$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$3, op$1$1, eta$0$1$1) {
        return (function(page$2) {
          return this$3.onPage$1__p1__F1__O__F1__s_Option(eta$0$1$1, page$2, op$1$1)
        })
      })($this, op$1, eta$0$1));
      var action = new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function(this$4, op$1$2, a$1) {
        return (function(x$63$2, p$2) {
          $as_Ljapgolly_scalajs_react_extra_router_Path(x$63$2);
          return this$4.onPage$1__p1__F1__O__F1__s_Option(a$1, p$2, op$1$2)
        })
      })($this, op$1, a));
      return new $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule().init___F1__F1__F2(parse, path$1, action)
    })
  })(this, r, op))
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl.prototype.init___ = (function() {
  this.int$1 = new $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB().init___T__I__F1__F1("(-?\\d+)", 1, new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(g$2) {
      var g = $as_F1(g$2);
      var x = $as_T(g.apply__O__O(0));
      var this$2 = new $c_sci_StringOps().init___T(x);
      var this$4 = $m_jl_Integer$();
      var $$this = this$2.repr$1;
      return new $c_s_Some().init___O(this$4.parseInt__T__I__I($$this, 10))
    })
  })(this)), new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$1) {
    return (function(x$51$2) {
      var x$51 = $uI(x$51$2);
      return ("" + x$51)
    })
  })(this)));
  this.long$1 = new $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB().init___T__I__F1__F1("(-?\\d+)", 1, new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$3$1) {
    return (function(g$3$2) {
      var g$3 = $as_F1(g$3$2);
      var x$1 = $as_T(g$3.apply__O__O(0));
      var this$7 = new $c_sci_StringOps().init___T(x$1);
      var this$9 = $m_jl_Long$();
      var $$this$1 = this$7.repr$1;
      return new $c_s_Some().init___O(this$9.parseLong__T__I__J($$this$1, 10))
    })
  })(this)), new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$4$1) {
    return (function(x$52$2) {
      var t = $uJ(x$52$2);
      var lo = t.lo$2;
      var hi = t.hi$2;
      return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toString__I__I__T(lo, hi)
    })
  })(this)));
  this.uuid$1 = new $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB().init___T__I__F1__F1("([A-Fa-f0-9]{8}(?:-[A-Fa-f0-9]{4}){3}-[A-Fa-f0-9]{12})", 1, new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$5$1) {
    return (function(g$4$2) {
      var g$4 = $as_F1(g$4$2);
      return new $c_s_Some().init___O($m_ju_UUID$().fromString__T__ju_UUID($as_T(g$4.apply__O__O(0))))
    })
  })(this)), new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$6$1) {
    return (function(x$53$2) {
      var x$53 = $as_ju_UUID(x$53$2);
      return x$53.toString__T()
    })
  })(this)));
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl.prototype.rewritePathR__ju_regex_Pattern__F1__Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule = (function(r, f) {
  return this.rewritePathF__F1__Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, r$1, f$1) {
    return (function(p$2) {
      var p = $as_Ljapgolly_scalajs_react_extra_router_Path(p$2);
      var input = p.value$2;
      var m = new $c_ju_regex_Matcher().init___ju_regex_Pattern__jl_CharSequence__I__I(r$1, input, 0, $uI(input.length));
      return (m.matches__Z() ? $as_s_Option(f$1.apply__O__O(m)) : $m_s_None$())
    })
  })(this, r, f)))
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl.prototype.$$undauto$undnotFound$undfrom$undparsed__O__F1__F1 = (function(a, evidence$8) {
  return new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, a$1, evidence$8$1) {
    return (function(x$57$2) {
      $as_Ljapgolly_scalajs_react_extra_router_Path(x$57$2);
      return $as_s_util_Either(evidence$8$1.apply__O__O(a$1))
    })
  })(this, a, evidence$8))
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl.prototype.onPage$1__p1__F1__O__F1__s_Option = (function(f, page, op$1) {
  var this$1 = $as_s_Option(op$1.apply__O__O(page));
  return (this$1.isEmpty__Z() ? $m_s_None$() : new $c_s_Some().init___O(f.apply__O__O(this$1.get__O())))
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl.prototype.removeLeadingSlashes__Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule = (function() {
  var this$2 = new $c_sci_StringOps().init___T("^/+(.*)$");
  var groupNames = $m_sci_Nil$();
  var $$this = this$2.repr$1;
  var r = new $c_s_util_matching_Regex().init___T__sc_Seq($$this, groupNames);
  return this.rewritePathR__ju_regex_Pattern__F1__Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule(r.pattern$1, new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(m$2) {
      var m = $as_ju_regex_Matcher(m$2);
      var a = $this.redirectToPath__T__Ljapgolly_scalajs_react_extra_router_Redirect$Method__Ljapgolly_scalajs_react_extra_router_RedirectToPath(m.group__I__T(1), $m_Ljapgolly_scalajs_react_extra_router_Redirect$Replace$());
      return new $c_s_Some().init___O(a)
    })
  })(this)))
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl.prototype.trimSlashes__Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule = (function() {
  var this$2 = new $c_sci_StringOps().init___T("^/*(.*?)/+$");
  var groupNames = $m_sci_Nil$();
  var $$this = this$2.repr$1;
  var r = new $c_s_util_matching_Regex().init___T__sc_Seq($$this, groupNames);
  return this.rewritePathR__ju_regex_Pattern__F1__Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule(r.pattern$1, new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(m$2) {
      var m = $as_ju_regex_Matcher(m$2);
      var a = $this.redirectToPath__T__Ljapgolly_scalajs_react_extra_router_Redirect$Method__Ljapgolly_scalajs_react_extra_router_RedirectToPath(m.group__I__T(1), $m_Ljapgolly_scalajs_react_extra_router_Redirect$Replace$());
      return new $c_s_Some().init___O(a)
    })
  })(this))).$$bar__Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule__Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule(this.removeLeadingSlashes__Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule())
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl.prototype.$$undauto$undpToAction$undfrom$undaction__F0__F1 = (function(a) {
  return new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, a$1) {
    return (function(x$62$2) {
      return $as_Ljapgolly_scalajs_react_extra_router_Action(a$1.apply__O())
    })
  })(this, a))
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl.prototype.$$undauto$undrouteParser$undfrom$undparsedFO__F1__F1__F1 = (function(f, evidence$13) {
  return new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, f$1, evidence$13$1) {
    return (function(x$61$2) {
      var x$61 = $as_Ljapgolly_scalajs_react_extra_router_Path(x$61$2);
      var this$1 = $as_s_Option(f$1.apply__O__O(x$61));
      if (this$1.isEmpty__Z()) {
        return $m_s_None$()
      } else {
        var arg1 = this$1.get__O();
        return new $c_s_Some().init___O($as_s_util_Either(evidence$13$1.apply__O__O(arg1)))
      }
    })
  })(this, f, evidence$13))
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl.prototype.render__F0__F1__Ljapgolly_scalajs_react_extra_router_Renderer = (function(a, evidence$2) {
  return new $c_Ljapgolly_scalajs_react_extra_router_Renderer().init___F1(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, a$1, evidence$2$1) {
    return (function(x$54$2) {
      $as_Ljapgolly_scalajs_react_extra_router_RouterCtl(x$54$2);
      return $as_Ljapgolly_scalajs_react_vdom_VdomElement(evidence$2$1.apply__O__O(a$1.apply__O()))
    })
  })(this, a, evidence$2)))
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl.prototype.rewritePathF__F1__Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule = (function(f) {
  return $m_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule$().parseOnly__F1__Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule(this.$$undauto$undrouteParser$undfrom$undparsedFO__F1__F1__F1(f, new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(r$2) {
      var r = $as_Ljapgolly_scalajs_react_extra_router_Redirect(r$2);
      $m_s_package$();
      return new $c_s_util_Left().init___O(r)
    })
  })(this))))
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl.prototype.redirectToPath__T__Ljapgolly_scalajs_react_extra_router_Redirect$Method__Ljapgolly_scalajs_react_extra_router_RedirectToPath = (function(path, method) {
  var path$1 = new $c_Ljapgolly_scalajs_react_extra_router_Path().init___T(path);
  return new $c_Ljapgolly_scalajs_react_extra_router_RedirectToPath().init___Ljapgolly_scalajs_react_extra_router_Path__Ljapgolly_scalajs_react_extra_router_Redirect$Method(path$1, method)
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl.prototype.staticRoute__Ljapgolly_scalajs_react_extra_router_StaticDsl$Route__O__F1 = (function(r, page) {
  var ev2 = $m_s_Predef$().scala$Predef$$singleton$und$eq$colon$eq$f;
  var r$1 = $as_Ljapgolly_scalajs_react_extra_router_StaticDsl$Route(r.xmap__F1__F1__Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteCommon(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, b) {
    return (function(x$22$2) {
      return b
    })
  })(r, page)), new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$1, ev2$1) {
    return (function(x$23$2) {
      return (void 0)
    })
  })(r, ev2))));
  var pf = new $c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$$anonfun$1().init___Ljapgolly_scalajs_react_extra_router_RouterConfigDsl__O(this, page);
  var dyn = this.dynamicRouteF__Ljapgolly_scalajs_react_extra_router_StaticDsl$Route__F1__F1(r$1, new $c_s_PartialFunction$Lifted().init___s_PartialFunction(pf));
  return new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1, dyn$1) {
    return (function(a$2) {
      var a = $as_F0(a$2);
      var g = $this$1.$$undauto$undpToAction$undfrom$undaction__F0__F1(a);
      return $as_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule(dyn$1.apply__O__O(g))
    })
  })(this, dyn))
});
var $d_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_RouterConfigDsl: 0
}, false, "japgolly.scalajs.react.extra.router.RouterConfigDsl", {
  Ljapgolly_scalajs_react_extra_router_RouterConfigDsl: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl;
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$BuildInterface() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$BuildInterface.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$BuildInterface.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$BuildInterface;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$BuildInterface() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$BuildInterface.prototype = $c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$BuildInterface.prototype;
$c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$BuildInterface.prototype.init___ = (function() {
  return this
});
var $d_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$BuildInterface = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$BuildInterface: 0
}, false, "japgolly.scalajs.react.extra.router.RouterConfigDsl$BuildInterface", {
  Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$BuildInterface: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$BuildInterface.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$BuildInterface;
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_RouterCtl() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_extra_router_RouterCtl.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_router_RouterCtl.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_RouterCtl;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_RouterCtl() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_RouterCtl.prototype = $c_Ljapgolly_scalajs_react_extra_router_RouterCtl.prototype;
function $is_Ljapgolly_scalajs_react_extra_router_RouterCtl(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_extra_router_RouterCtl)))
}
function $as_Ljapgolly_scalajs_react_extra_router_RouterCtl(obj) {
  return (($is_Ljapgolly_scalajs_react_extra_router_RouterCtl(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.extra.router.RouterCtl"))
}
function $isArrayOf_Ljapgolly_scalajs_react_extra_router_RouterCtl(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_extra_router_RouterCtl)))
}
function $asArrayOf_Ljapgolly_scalajs_react_extra_router_RouterCtl(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_extra_router_RouterCtl(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.extra.router.RouterCtl;", depth))
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$() {
  $c_O.call(this);
  this.regexEscape1$1 = null;
  this.regexEscape2$1 = null
}
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_StaticDsl$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_StaticDsl$.prototype = $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$.prototype;
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_extra_router_StaticDsl$ = this;
  var this$2 = new $c_sci_StringOps().init___T("([-()\\[\\]{}+?*.$\\^|,:#<!\\\\])");
  var groupNames = $m_sci_Nil$();
  var $$this = this$2.repr$1;
  this.regexEscape1$1 = new $c_s_util_matching_Regex().init___T__sc_Seq($$this, groupNames);
  var this$5 = new $c_sci_StringOps().init___T("\\x08");
  var groupNames$1 = $m_sci_Nil$();
  var $$this$1 = this$5.repr$1;
  this.regexEscape2$1 = new $c_s_util_matching_Regex().init___T__sc_Seq($$this$1, groupNames$1);
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$.prototype.regexEscape__T__T = (function(s) {
  var r = s;
  r = this.regexEscape1$1.replaceAllIn__jl_CharSequence__T__T(r, "\\\\$1");
  r = this.regexEscape2$1.replaceAllIn__jl_CharSequence__T__T(r, "\\\\x08");
  return r
});
var $d_Ljapgolly_scalajs_react_extra_router_StaticDsl$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_StaticDsl$: 0
}, false, "japgolly.scalajs.react.extra.router.StaticDsl$", {
  Ljapgolly_scalajs_react_extra_router_StaticDsl$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_StaticDsl$;
var $n_Ljapgolly_scalajs_react_extra_router_StaticDsl$ = (void 0);
function $m_Ljapgolly_scalajs_react_extra_router_StaticDsl$() {
  if ((!$n_Ljapgolly_scalajs_react_extra_router_StaticDsl$)) {
    $n_Ljapgolly_scalajs_react_extra_router_StaticDsl$ = new $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$().init___()
  };
  return $n_Ljapgolly_scalajs_react_extra_router_StaticDsl$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB$() {
  $c_O.call(this);
  this.someUnit$1 = null;
  this.$$div$1 = null
}
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB$.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB$.prototype = $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB$.prototype;
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB$ = this;
  this.someUnit$1 = new $c_s_Some().init___O((void 0));
  this.$$div$1 = this.literal__T__Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB("/");
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB$.prototype.literal__T__Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB = (function(s) {
  return new $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB().init___T__I__F1__F1($m_Ljapgolly_scalajs_react_extra_router_StaticDsl$().regexEscape__T__T(s), 0, new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$19$2) {
      $as_F1(x$19$2);
      return $this.someUnit$1
    })
  })(this)), new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2, s$1) {
    return (function(x$20$2) {
      $asUnit(x$20$2);
      return s$1
    })
  })(this, s)))
});
var $d_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB$: 0
}, false, "japgolly.scalajs.react.extra.router.StaticDsl$RouteB$", {
  Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB$.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB$;
var $n_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB$ = (void 0);
function $m_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB$() {
  if ((!$n_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB$)) {
    $n_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB$ = new $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB$().init___()
  };
  return $n_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteCommon() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteCommon.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteCommon.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteCommon;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteCommon() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteCommon.prototype = $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteCommon.prototype;
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteCommon.prototype.xmap__F1__F1__Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteCommon = (function(b, a) {
  return this.pmap__F1__F1__Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteCommon(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, b$1) {
    return (function(a$2$2) {
      return new $c_s_Some().init___O(b$1.apply__O__O(a$2$2))
    })
  })(this, b)), a)
});
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_package$OptionFn2Ext$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_extra_router_package$OptionFn2Ext$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_router_package$OptionFn2Ext$.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_package$OptionFn2Ext$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_package$OptionFn2Ext$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_package$OptionFn2Ext$.prototype = $c_Ljapgolly_scalajs_react_extra_router_package$OptionFn2Ext$.prototype;
$c_Ljapgolly_scalajs_react_extra_router_package$OptionFn2Ext$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_package$OptionFn2Ext$.prototype.$$bar$extension__F2__F2__F2 = (function($$this, g) {
  return new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function($this, $$this$1, g$1) {
    return (function(a$2, b$2) {
      var this$1 = $as_s_Option($$this$1.apply__O__O__O(a$2, b$2));
      return (this$1.isEmpty__Z() ? g$1.apply__O__O__O(a$2, b$2) : this$1.get__O())
    })
  })(this, $$this, g))
});
var $d_Ljapgolly_scalajs_react_extra_router_package$OptionFn2Ext$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_package$OptionFn2Ext$: 0
}, false, "japgolly.scalajs.react.extra.router.package$OptionFn2Ext$", {
  Ljapgolly_scalajs_react_extra_router_package$OptionFn2Ext$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_extra_router_package$OptionFn2Ext$.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_package$OptionFn2Ext$;
var $n_Ljapgolly_scalajs_react_extra_router_package$OptionFn2Ext$ = (void 0);
function $m_Ljapgolly_scalajs_react_extra_router_package$OptionFn2Ext$() {
  if ((!$n_Ljapgolly_scalajs_react_extra_router_package$OptionFn2Ext$)) {
    $n_Ljapgolly_scalajs_react_extra_router_package$OptionFn2Ext$ = new $c_Ljapgolly_scalajs_react_extra_router_package$OptionFn2Ext$().init___()
  };
  return $n_Ljapgolly_scalajs_react_extra_router_package$OptionFn2Ext$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_package$OptionFnExt$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_extra_router_package$OptionFnExt$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_router_package$OptionFnExt$.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_package$OptionFnExt$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_package$OptionFnExt$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_package$OptionFnExt$.prototype = $c_Ljapgolly_scalajs_react_extra_router_package$OptionFnExt$.prototype;
$c_Ljapgolly_scalajs_react_extra_router_package$OptionFnExt$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_package$OptionFnExt$.prototype.$$bar$bar$extension__F1__F1__F1 = (function($$this, g) {
  return new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, $$this$1, g$1) {
    return (function(a$2) {
      var this$1 = $as_s_Option($$this$1.apply__O__O(a$2));
      return (this$1.isEmpty__Z() ? $as_s_Option(g$1.apply__O__O(a$2)) : this$1)
    })
  })(this, $$this, g))
});
$c_Ljapgolly_scalajs_react_extra_router_package$OptionFnExt$.prototype.$$bar$extension__F1__F1__F1 = (function($$this, g) {
  return new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, $$this$1, g$1) {
    return (function(a$2) {
      var this$1 = $as_s_Option($$this$1.apply__O__O(a$2));
      return (this$1.isEmpty__Z() ? g$1.apply__O__O(a$2) : this$1.get__O())
    })
  })(this, $$this, g))
});
var $d_Ljapgolly_scalajs_react_extra_router_package$OptionFnExt$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_package$OptionFnExt$: 0
}, false, "japgolly.scalajs.react.extra.router.package$OptionFnExt$", {
  Ljapgolly_scalajs_react_extra_router_package$OptionFnExt$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_extra_router_package$OptionFnExt$.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_package$OptionFnExt$;
var $n_Ljapgolly_scalajs_react_extra_router_package$OptionFnExt$ = (void 0);
function $m_Ljapgolly_scalajs_react_extra_router_package$OptionFnExt$() {
  if ((!$n_Ljapgolly_scalajs_react_extra_router_package$OptionFnExt$)) {
    $n_Ljapgolly_scalajs_react_extra_router_package$OptionFnExt$ = new $c_Ljapgolly_scalajs_react_extra_router_package$OptionFnExt$().init___()
  };
  return $n_Ljapgolly_scalajs_react_extra_router_package$OptionFnExt$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_Box$() {
  $c_O.call(this);
  this.Unit$1 = null
}
$c_Ljapgolly_scalajs_react_internal_Box$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_Box$.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_Box$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_Box$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_Box$.prototype = $c_Ljapgolly_scalajs_react_internal_Box$.prototype;
$c_Ljapgolly_scalajs_react_internal_Box$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_internal_Box$ = this;
  this.Unit$1 = ($m_Ljapgolly_scalajs_react_internal_Box$(), {
    "a": (void 0)
  });
  return this
});
var $d_Ljapgolly_scalajs_react_internal_Box$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_Box$: 0
}, false, "japgolly.scalajs.react.internal.Box$", {
  Ljapgolly_scalajs_react_internal_Box$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_Box$.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_Box$;
var $n_Ljapgolly_scalajs_react_internal_Box$ = (void 0);
function $m_Ljapgolly_scalajs_react_internal_Box$() {
  if ((!$n_Ljapgolly_scalajs_react_internal_Box$)) {
    $n_Ljapgolly_scalajs_react_internal_Box$ = new $c_Ljapgolly_scalajs_react_internal_Box$().init___()
  };
  return $n_Ljapgolly_scalajs_react_internal_Box$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_Effect() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_internal_Effect.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_Effect.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_Effect;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_Effect() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_Effect.prototype = $c_Ljapgolly_scalajs_react_internal_Effect.prototype;
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_Effect$() {
  $c_O.call(this);
  this.idInstance$1 = null;
  this.callbackInstance$1 = null
}
$c_Ljapgolly_scalajs_react_internal_Effect$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_Effect$.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_Effect$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_Effect$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_Effect$.prototype = $c_Ljapgolly_scalajs_react_internal_Effect$.prototype;
$c_Ljapgolly_scalajs_react_internal_Effect$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_internal_Effect$ = this;
  this.idInstance$1 = new $c_Ljapgolly_scalajs_react_internal_Effect$$anon$1().init___();
  this.callbackInstance$1 = new $c_Ljapgolly_scalajs_react_internal_Effect$$anon$2().init___();
  return this
});
var $d_Ljapgolly_scalajs_react_internal_Effect$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_Effect$: 0
}, false, "japgolly.scalajs.react.internal.Effect$", {
  Ljapgolly_scalajs_react_internal_Effect$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_Effect$.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_Effect$;
var $n_Ljapgolly_scalajs_react_internal_Effect$ = (void 0);
function $m_Ljapgolly_scalajs_react_internal_Effect$() {
  if ((!$n_Ljapgolly_scalajs_react_internal_Effect$)) {
    $n_Ljapgolly_scalajs_react_internal_Effect$ = new $c_Ljapgolly_scalajs_react_internal_Effect$().init___()
  };
  return $n_Ljapgolly_scalajs_react_internal_Effect$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_Effect$Trans() {
  $c_O.call(this);
  this.from$1 = null;
  this.to$1 = null
}
$c_Ljapgolly_scalajs_react_internal_Effect$Trans.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_Effect$Trans.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_Effect$Trans;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_Effect$Trans() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_Effect$Trans.prototype = $c_Ljapgolly_scalajs_react_internal_Effect$Trans.prototype;
$c_Ljapgolly_scalajs_react_internal_Effect$Trans.prototype.apply__F0__O = (function(f) {
  var fn = this.from$1.extract__F0__F0(f);
  return this.to$1.point__F0__O(fn)
});
$c_Ljapgolly_scalajs_react_internal_Effect$Trans.prototype.compose__Ljapgolly_scalajs_react_internal_Effect$Trans__s_Predef$$less$colon$less__Ljapgolly_scalajs_react_internal_Effect$Trans = (function(t, ev) {
  if ((ev === null)) {
    return new $c_Ljapgolly_scalajs_react_internal_Effect$Trans().init___Ljapgolly_scalajs_react_internal_Effect__Ljapgolly_scalajs_react_internal_Effect(this.from$1, t.to$1)
  } else {
    $m_Ljapgolly_scalajs_react_internal_Effect$Trans$();
    var F = this.from$1;
    var x = new $c_Ljapgolly_scalajs_react_internal_Effect$Trans$Id().init___Ljapgolly_scalajs_react_internal_Effect(F);
    return x
  }
});
$c_Ljapgolly_scalajs_react_internal_Effect$Trans.prototype.init___Ljapgolly_scalajs_react_internal_Effect__Ljapgolly_scalajs_react_internal_Effect = (function(from, to) {
  this.from$1 = from;
  this.to$1 = to;
  return this
});
var $d_Ljapgolly_scalajs_react_internal_Effect$Trans = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_Effect$Trans: 0
}, false, "japgolly.scalajs.react.internal.Effect$Trans", {
  Ljapgolly_scalajs_react_internal_Effect$Trans: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_Effect$Trans.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_Effect$Trans;
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_Effect$Trans$() {
  $c_O.call(this);
  this.endoId$1 = null;
  this.endoCallback$1 = null;
  this.idToCallback$1 = null;
  this.callbackToId$1 = null
}
$c_Ljapgolly_scalajs_react_internal_Effect$Trans$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_Effect$Trans$.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_Effect$Trans$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_Effect$Trans$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_Effect$Trans$.prototype = $c_Ljapgolly_scalajs_react_internal_Effect$Trans$.prototype;
$c_Ljapgolly_scalajs_react_internal_Effect$Trans$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_internal_Effect$Trans$ = this;
  $m_Ljapgolly_scalajs_react_internal_Effect$Trans$();
  var F = $m_Ljapgolly_scalajs_react_internal_Effect$().idInstance$1;
  this.endoId$1 = new $c_Ljapgolly_scalajs_react_internal_Effect$Trans$Id().init___Ljapgolly_scalajs_react_internal_Effect(F);
  $m_Ljapgolly_scalajs_react_internal_Effect$Trans$();
  var F$1 = $m_Ljapgolly_scalajs_react_internal_Effect$().callbackInstance$1;
  this.endoCallback$1 = new $c_Ljapgolly_scalajs_react_internal_Effect$Trans$Id().init___Ljapgolly_scalajs_react_internal_Effect(F$1);
  this.idToCallback$1 = $m_Ljapgolly_scalajs_react_internal_Effect$Trans$().apply__Ljapgolly_scalajs_react_internal_Effect__Ljapgolly_scalajs_react_internal_Effect__s_Predef$$eq$colon$eq__Ljapgolly_scalajs_react_internal_Effect$Trans($m_Ljapgolly_scalajs_react_internal_Effect$().idInstance$1, $m_Ljapgolly_scalajs_react_internal_Effect$().callbackInstance$1, ($m_Ljapgolly_scalajs_react_internal_Effect$Trans$(), null));
  this.callbackToId$1 = $m_Ljapgolly_scalajs_react_internal_Effect$Trans$().apply__Ljapgolly_scalajs_react_internal_Effect__Ljapgolly_scalajs_react_internal_Effect__s_Predef$$eq$colon$eq__Ljapgolly_scalajs_react_internal_Effect$Trans($m_Ljapgolly_scalajs_react_internal_Effect$().callbackInstance$1, $m_Ljapgolly_scalajs_react_internal_Effect$().idInstance$1, ($m_Ljapgolly_scalajs_react_internal_Effect$Trans$(), null));
  return this
});
$c_Ljapgolly_scalajs_react_internal_Effect$Trans$.prototype.apply__Ljapgolly_scalajs_react_internal_Effect__Ljapgolly_scalajs_react_internal_Effect__s_Predef$$eq$colon$eq__Ljapgolly_scalajs_react_internal_Effect$Trans = (function(F, G, ev) {
  if ((ev === null)) {
    return new $c_Ljapgolly_scalajs_react_internal_Effect$Trans().init___Ljapgolly_scalajs_react_internal_Effect__Ljapgolly_scalajs_react_internal_Effect(F, G)
  } else {
    var x = new $c_Ljapgolly_scalajs_react_internal_Effect$Trans$Id().init___Ljapgolly_scalajs_react_internal_Effect(F);
    return x
  }
});
var $d_Ljapgolly_scalajs_react_internal_Effect$Trans$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_Effect$Trans$: 0
}, false, "japgolly.scalajs.react.internal.Effect$Trans$", {
  Ljapgolly_scalajs_react_internal_Effect$Trans$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_Effect$Trans$.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_Effect$Trans$;
var $n_Ljapgolly_scalajs_react_internal_Effect$Trans$ = (void 0);
function $m_Ljapgolly_scalajs_react_internal_Effect$Trans$() {
  if ((!$n_Ljapgolly_scalajs_react_internal_Effect$Trans$)) {
    $n_Ljapgolly_scalajs_react_internal_Effect$Trans$ = new $c_Ljapgolly_scalajs_react_internal_Effect$Trans$().init___()
  };
  return $n_Ljapgolly_scalajs_react_internal_Effect$Trans$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_JsUtil$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_internal_JsUtil$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_JsUtil$.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_JsUtil$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_JsUtil$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_JsUtil$.prototype = $c_Ljapgolly_scalajs_react_internal_JsUtil$.prototype;
$c_Ljapgolly_scalajs_react_internal_JsUtil$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_internal_JsUtil$.prototype.objectIterator__sjs_js_Object__sc_Iterator = (function(o) {
  var array = $propertiesOf(o);
  var this$2 = new $c_sjs_js_ArrayOps().init___sjs_js_Array(array);
  var this$5 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this$2, 0, $uI(this$2.scala$scalajs$js$ArrayOps$$array$f.length));
  var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, d) {
    return (function(n$2) {
      var n = $as_T(n$2);
      try {
        var v = d[n]
      } catch (e) {
        var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
        if ((e$2 !== null)) {
          var v = e$2.toString__T()
        } else {
          var v;
          throw e
        }
      };
      return new $c_T2().init___O__O(n, v)
    })
  })(this, o));
  return new $c_sc_Iterator$$anon$10().init___sc_Iterator__F1(this$5, f)
});
var $d_Ljapgolly_scalajs_react_internal_JsUtil$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_JsUtil$: 0
}, false, "japgolly.scalajs.react.internal.JsUtil$", {
  Ljapgolly_scalajs_react_internal_JsUtil$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_JsUtil$.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_JsUtil$;
var $n_Ljapgolly_scalajs_react_internal_JsUtil$ = (void 0);
function $m_Ljapgolly_scalajs_react_internal_JsUtil$() {
  if ((!$n_Ljapgolly_scalajs_react_internal_JsUtil$)) {
    $n_Ljapgolly_scalajs_react_internal_JsUtil$ = new $c_Ljapgolly_scalajs_react_internal_JsUtil$().init___()
  };
  return $n_Ljapgolly_scalajs_react_internal_JsUtil$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_Lens() {
  $c_O.call(this);
  this.get$1 = null;
  this.set$1 = null;
  this.mod$1 = null
}
$c_Ljapgolly_scalajs_react_internal_Lens.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_Lens.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_Lens;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_Lens() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_Lens.prototype = $c_Ljapgolly_scalajs_react_internal_Lens.prototype;
$c_Ljapgolly_scalajs_react_internal_Lens.prototype.init___F1__F1 = (function(get, set) {
  this.get$1 = get;
  this.set$1 = set;
  this.mod$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(f$2) {
      var f = $as_F1(f$2);
      return new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1, f$1) {
        return (function(a$2) {
          return $as_F1($this$1.set$1.apply__O__O(f$1.apply__O__O($this$1.get$1.apply__O__O(a$2)))).apply__O__O(a$2)
        })
      })($this, f))
    })
  })(this));
  return this
});
var $d_Ljapgolly_scalajs_react_internal_Lens = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_Lens: 0
}, false, "japgolly.scalajs.react.internal.Lens", {
  Ljapgolly_scalajs_react_internal_Lens: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_Lens.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_Lens;
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_Lens$() {
  $c_O.call(this);
  this.idInstance$1 = null
}
$c_Ljapgolly_scalajs_react_internal_Lens$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_Lens$.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_Lens$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_Lens$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_Lens$.prototype = $c_Ljapgolly_scalajs_react_internal_Lens$.prototype;
$c_Ljapgolly_scalajs_react_internal_Lens$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_internal_Lens$ = this;
  this.idInstance$1 = this.$$undid__p1__Ljapgolly_scalajs_react_internal_Lens();
  return this
});
$c_Ljapgolly_scalajs_react_internal_Lens$.prototype.$$undid__p1__Ljapgolly_scalajs_react_internal_Lens = (function() {
  var get = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(a$2) {
      return a$2
    })
  })(this));
  var set = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2) {
    return (function(a$3$2) {
      return new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1, a) {
        return (function(x$2$2) {
          return a
        })
      })(this$2, a$3$2))
    })
  })(this));
  return new $c_Ljapgolly_scalajs_react_internal_Lens().init___F1__F1(get, set)
});
var $d_Ljapgolly_scalajs_react_internal_Lens$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_Lens$: 0
}, false, "japgolly.scalajs.react.internal.Lens$", {
  Ljapgolly_scalajs_react_internal_Lens$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_Lens$.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_Lens$;
var $n_Ljapgolly_scalajs_react_internal_Lens$ = (void 0);
function $m_Ljapgolly_scalajs_react_internal_Lens$() {
  if ((!$n_Ljapgolly_scalajs_react_internal_Lens$)) {
    $n_Ljapgolly_scalajs_react_internal_Lens$ = new $c_Ljapgolly_scalajs_react_internal_Lens$().init___()
  };
  return $n_Ljapgolly_scalajs_react_internal_Lens$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_Profunctor$Ops() {
  $c_O.call(this);
  this.f$1 = null;
  this.p$1 = null
}
$c_Ljapgolly_scalajs_react_internal_Profunctor$Ops.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_Profunctor$Ops.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_Profunctor$Ops;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_Profunctor$Ops() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_Profunctor$Ops.prototype = $c_Ljapgolly_scalajs_react_internal_Profunctor$Ops.prototype;
$c_Ljapgolly_scalajs_react_internal_Profunctor$Ops.prototype.init___O__Ljapgolly_scalajs_react_internal_Profunctor = (function(f, p) {
  this.f$1 = f;
  this.p$1 = p;
  return this
});
$c_Ljapgolly_scalajs_react_internal_Profunctor$Ops.prototype.dimap__F1__F1__O = (function(l, r) {
  var this$1 = this.p$1;
  var f = this.f$1;
  return this$1.dimap__Ljapgolly_scalajs_react_CtorType$Nullary__F1__F1__Ljapgolly_scalajs_react_CtorType$Nullary($as_Ljapgolly_scalajs_react_CtorType$Nullary(f), l, r)
});
var $d_Ljapgolly_scalajs_react_internal_Profunctor$Ops = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_Profunctor$Ops: 0
}, false, "japgolly.scalajs.react.internal.Profunctor$Ops", {
  Ljapgolly_scalajs_react_internal_Profunctor$Ops: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_Profunctor$Ops.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_Profunctor$Ops;
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_Singleton() {
  $c_O.call(this);
  this.value$1 = null;
  this.mutableObj$1 = null
}
$c_Ljapgolly_scalajs_react_internal_Singleton.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_Singleton.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_Singleton;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_Singleton() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_Singleton.prototype = $c_Ljapgolly_scalajs_react_internal_Singleton.prototype;
$c_Ljapgolly_scalajs_react_internal_Singleton.prototype.init___O__F0__F0 = (function(value, mutable, mutableObj) {
  this.value$1 = value;
  this.mutableObj$1 = mutableObj;
  return this
});
var $d_Ljapgolly_scalajs_react_internal_Singleton = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_Singleton: 0
}, false, "japgolly.scalajs.react.internal.Singleton", {
  Ljapgolly_scalajs_react_internal_Singleton: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_Singleton.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_Singleton;
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_Singleton$() {
  $c_O.call(this);
  this.Null$1 = null;
  this.Unit$1 = null;
  this.BoxUnit$1 = null
}
$c_Ljapgolly_scalajs_react_internal_Singleton$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_Singleton$.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_Singleton$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_Singleton$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_Singleton$.prototype = $c_Ljapgolly_scalajs_react_internal_Singleton$.prototype;
$c_Ljapgolly_scalajs_react_internal_Singleton$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_internal_Singleton$ = this;
  this.Null$1 = new $c_Ljapgolly_scalajs_react_internal_Singleton().init___O__F0__F0(null, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
    return (function() {
      return null
    })
  })(this)), new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2) {
    return (function() {
      return {}
    })
  })(this)));
  this.Unit$1 = new $c_Ljapgolly_scalajs_react_internal_Singleton().init___O__F0__F0((void 0), new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$3) {
    return (function() {
      return (void 0)
    })
  })(this)), new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$4) {
    return (function() {
      return {}
    })
  })(this)));
  this.BoxUnit$1 = new $c_Ljapgolly_scalajs_react_internal_Singleton().init___O__F0__F0($m_Ljapgolly_scalajs_react_internal_Box$().Unit$1, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$5) {
    return (function() {
      $m_Ljapgolly_scalajs_react_internal_Box$();
      return {
        "a": (void 0)
      }
    })
  })(this)), new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$6) {
    return (function() {
      $m_Ljapgolly_scalajs_react_internal_Box$();
      return {
        "a": (void 0)
      }
    })
  })(this)));
  return this
});
var $d_Ljapgolly_scalajs_react_internal_Singleton$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_Singleton$: 0
}, false, "japgolly.scalajs.react.internal.Singleton$", {
  Ljapgolly_scalajs_react_internal_Singleton$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_Singleton$.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_Singleton$;
var $n_Ljapgolly_scalajs_react_internal_Singleton$ = (void 0);
function $m_Ljapgolly_scalajs_react_internal_Singleton$() {
  if ((!$n_Ljapgolly_scalajs_react_internal_Singleton$)) {
    $n_Ljapgolly_scalajs_react_internal_Singleton$ = new $c_Ljapgolly_scalajs_react_internal_Singleton$().init___()
  };
  return $n_Ljapgolly_scalajs_react_internal_Singleton$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_package$() {
  $c_O.call(this);
  this.identityFnInstance$1 = null
}
$c_Ljapgolly_scalajs_react_internal_package$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_package$.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_package$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_package$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_package$.prototype = $c_Ljapgolly_scalajs_react_internal_package$.prototype;
$c_Ljapgolly_scalajs_react_internal_package$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_internal_package$ = this;
  this.identityFnInstance$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(a$2) {
      return a$2
    })
  })(this));
  return this
});
var $d_Ljapgolly_scalajs_react_internal_package$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_package$: 0
}, false, "japgolly.scalajs.react.internal.package$", {
  Ljapgolly_scalajs_react_internal_package$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_package$.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_package$;
var $n_Ljapgolly_scalajs_react_internal_package$ = (void 0);
function $m_Ljapgolly_scalajs_react_internal_package$() {
  if ((!$n_Ljapgolly_scalajs_react_internal_package$)) {
    $n_Ljapgolly_scalajs_react_internal_package$ = new $c_Ljapgolly_scalajs_react_internal_package$().init___()
  };
  return $n_Ljapgolly_scalajs_react_internal_package$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_Attr() {
  $c_O.call(this);
  this.name$1 = null
}
$c_Ljapgolly_scalajs_react_vdom_Attr.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Attr.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Attr;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_Attr() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_Attr.prototype = $c_Ljapgolly_scalajs_react_vdom_Attr.prototype;
$c_Ljapgolly_scalajs_react_vdom_Attr.prototype.equals__O__Z = (function(any) {
  if ($is_Ljapgolly_scalajs_react_vdom_Attr(any)) {
    var x2 = $as_Ljapgolly_scalajs_react_vdom_Attr(any);
    return (this.name$1 === x2.name$1)
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_vdom_Attr.prototype.toString__T = (function() {
  return new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["VdomAttr{name=", "}"])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.name$1]))
});
$c_Ljapgolly_scalajs_react_vdom_Attr.prototype.init___T = (function(name) {
  this.name$1 = name;
  return this
});
$c_Ljapgolly_scalajs_react_vdom_Attr.prototype.hashCode__I = (function() {
  return $m_sr_Statics$().anyHash__O__I(this.name$1)
});
function $is_Ljapgolly_scalajs_react_vdom_Attr(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_vdom_Attr)))
}
function $as_Ljapgolly_scalajs_react_vdom_Attr(obj) {
  return (($is_Ljapgolly_scalajs_react_vdom_Attr(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.vdom.Attr"))
}
function $isArrayOf_Ljapgolly_scalajs_react_vdom_Attr(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_vdom_Attr)))
}
function $asArrayOf_Ljapgolly_scalajs_react_vdom_Attr(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_vdom_Attr(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.vdom.Attr;", depth))
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_Attr$() {
  $c_O.call(this);
  this.Key$1 = null
}
$c_Ljapgolly_scalajs_react_vdom_Attr$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Attr$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Attr$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_Attr$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_Attr$.prototype = $c_Ljapgolly_scalajs_react_vdom_Attr$.prototype;
$c_Ljapgolly_scalajs_react_vdom_Attr$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_vdom_Attr$ = this;
  this.Key$1 = new $c_Ljapgolly_scalajs_react_vdom_Attr$Generic().init___T("key");
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_Attr$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Attr$: 0
}, false, "japgolly.scalajs.react.vdom.Attr$", {
  Ljapgolly_scalajs_react_vdom_Attr$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_Attr$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Attr$;
var $n_Ljapgolly_scalajs_react_vdom_Attr$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_Attr$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_Attr$)) {
    $n_Ljapgolly_scalajs_react_vdom_Attr$ = new $c_Ljapgolly_scalajs_react_vdom_Attr$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_Attr$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_Attr$ValueType$() {
  $c_O.call(this);
  this.direct$1 = null;
  this.string$1 = null
}
$c_Ljapgolly_scalajs_react_vdom_Attr$ValueType$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Attr$ValueType$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Attr$ValueType$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_Attr$ValueType$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_Attr$ValueType$.prototype = $c_Ljapgolly_scalajs_react_vdom_Attr$ValueType$.prototype;
$c_Ljapgolly_scalajs_react_vdom_Attr$ValueType$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_vdom_Attr$ValueType$ = this;
  var fn = new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function($this) {
    return (function(x$6$2, x$7$2) {
      var x$6 = $as_F1(x$6$2);
      x$6.apply__O__O(x$7$2)
    })
  })(this));
  this.direct$1 = fn;
  var fn$1 = new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function(this$2) {
    return (function(x$8$2, x$9$2) {
      var x$8 = $as_F1(x$8$2);
      var x$9 = $as_T(x$9$2);
      x$8.apply__O__O(x$9)
    })
  })(this));
  this.string$1 = fn$1;
  return this
});
$c_Ljapgolly_scalajs_react_vdom_Attr$ValueType$.prototype.byImplicit__F1__F2 = (function(f) {
  var fn = new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function($this, f$1) {
    return (function(b$2, a$2) {
      var b = $as_F1(b$2);
      b.apply__O__O(f$1.apply__O__O(a$2))
    })
  })(this, f));
  return fn
});
$c_Ljapgolly_scalajs_react_vdom_Attr$ValueType$.prototype.apply$extension__F2__T__O__Ljapgolly_scalajs_react_vdom_TagMod = (function($$this, name, value) {
  $m_Ljapgolly_scalajs_react_vdom_TagMod$();
  var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, $$this$1, name$1, value$1) {
    return (function(b$2) {
      var b = $as_Ljapgolly_scalajs_react_vdom_Builder(b$2);
      $$this$1.apply__O__O__O(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1, name$1$1, b$1) {
        return (function(x$5$2) {
          b$1.addAttr__T__sjs_js_Any__V(name$1$1, x$5$2)
        })
      })($this, name$1, b)), value$1)
    })
  })(this, $$this, name, value));
  return new $c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$1().init___F1(f)
});
var $d_Ljapgolly_scalajs_react_vdom_Attr$ValueType$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Attr$ValueType$: 0
}, false, "japgolly.scalajs.react.vdom.Attr$ValueType$", {
  Ljapgolly_scalajs_react_vdom_Attr$ValueType$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_Attr$ValueType$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Attr$ValueType$;
var $n_Ljapgolly_scalajs_react_vdom_Attr$ValueType$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_Attr$ValueType$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_Attr$ValueType$)) {
    $n_Ljapgolly_scalajs_react_vdom_Attr$ValueType$ = new $c_Ljapgolly_scalajs_react_vdom_Attr$ValueType$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_Attr$ValueType$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_Builder() {
  $c_O.call(this);
  this.className$1 = null;
  this.props$1 = null;
  this.style$1 = null;
  this.children$1 = null;
  this.addClassName$1 = null;
  this.addStyles$1 = null
}
$c_Ljapgolly_scalajs_react_vdom_Builder.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Builder.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Builder;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_Builder() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_Builder.prototype = $c_Ljapgolly_scalajs_react_vdom_Builder.prototype;
$c_Ljapgolly_scalajs_react_vdom_Builder.prototype.init___ = (function() {
  this.className$1 = (void 0);
  this.props$1 = {};
  this.style$1 = {};
  this.children$1 = [];
  this.addClassName$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(n$2) {
      var value = $this.className$1;
      if ((value === (void 0))) {
        var value$1 = n$2
      } else {
        var s = new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["", " ", ""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([value, n$2]));
        var value$1 = s
      };
      $this.className$1 = value$1
    })
  })(this));
  this.addStyles$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$1) {
    return (function(j$2) {
      var this$8 = $m_Ljapgolly_scalajs_react_internal_JsUtil$().objectIterator__sjs_js_Object__sc_Iterator(j$2);
      var p = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1) {
        return (function(check$ifrefutable$1$2) {
          var check$ifrefutable$1 = $as_T2(check$ifrefutable$1$2);
          return (check$ifrefutable$1 !== null)
        })
      })(this$2$1));
      var this$9 = new $c_sc_Iterator$$anon$12().init___sc_Iterator__F1(this$8, p);
      while (this$9.hasNext__Z()) {
        var arg1 = this$9.next__O();
        var x$2 = $as_T2(arg1);
        if ((x$2 !== null)) {
          var k = $as_T(x$2.$$und1$f);
          var v = x$2.$$und2$f;
          this$2$1.addStyle__T__sjs_js_Any__V(k, v)
        } else {
          throw new $c_s_MatchError().init___O(x$2)
        }
      }
    })
  })(this));
  return this
});
$c_Ljapgolly_scalajs_react_vdom_Builder.prototype.appendChild__sjs_js_$bar__V = (function(n) {
  this.children$1.push(n)
});
$c_Ljapgolly_scalajs_react_vdom_Builder.prototype.addAttr__T__sjs_js_Any__V = (function(k, v) {
  $m_Ljapgolly_scalajs_react_vdom_Builder$().set__sjs_js_Object__T__sjs_js_Any__V(this.props$1, k, v)
});
$c_Ljapgolly_scalajs_react_vdom_Builder.prototype.hasStyle__p1__Z = (function() {
  return ($uI($g.Object.keys(this.style$1).length) !== 0)
});
$c_Ljapgolly_scalajs_react_vdom_Builder.prototype.render__T__Ljapgolly_scalajs_react_vdom_VdomElement = (function(tag) {
  var value = this.className$1;
  if ((value !== (void 0))) {
    $m_Ljapgolly_scalajs_react_vdom_Builder$().set__sjs_js_Object__T__sjs_js_Any__V(this.props$1, "className", value)
  };
  if (this.hasStyle__p1__Z()) {
    $m_Ljapgolly_scalajs_react_vdom_Builder$().set__sjs_js_Object__T__sjs_js_Any__V(this.props$1, "style", this.style$1)
  };
  var n = $m_Ljapgolly_scalajs_react_vdom_Builder$().buildFn$1.apply__O__O__O__O(tag, this.props$1, this.children$1);
  return new $c_Ljapgolly_scalajs_react_vdom_VdomElement().init___Ljapgolly_scalajs_react_raw_package$ReactElement(n)
});
$c_Ljapgolly_scalajs_react_vdom_Builder.prototype.addStyle__T__sjs_js_Any__V = (function(k, v) {
  $m_Ljapgolly_scalajs_react_vdom_Builder$().set__sjs_js_Object__T__sjs_js_Any__V(this.style$1, k, v)
});
function $is_Ljapgolly_scalajs_react_vdom_Builder(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_vdom_Builder)))
}
function $as_Ljapgolly_scalajs_react_vdom_Builder(obj) {
  return (($is_Ljapgolly_scalajs_react_vdom_Builder(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.vdom.Builder"))
}
function $isArrayOf_Ljapgolly_scalajs_react_vdom_Builder(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_vdom_Builder)))
}
function $asArrayOf_Ljapgolly_scalajs_react_vdom_Builder(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_vdom_Builder(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.vdom.Builder;", depth))
}
var $d_Ljapgolly_scalajs_react_vdom_Builder = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Builder: 0
}, false, "japgolly.scalajs.react.vdom.Builder", {
  Ljapgolly_scalajs_react_vdom_Builder: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_Builder.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Builder;
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_Builder$() {
  $c_O.call(this);
  this.buildFn$1 = null
}
$c_Ljapgolly_scalajs_react_vdom_Builder$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Builder$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Builder$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_Builder$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_Builder$.prototype = $c_Ljapgolly_scalajs_react_vdom_Builder$.prototype;
$c_Ljapgolly_scalajs_react_vdom_Builder$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_vdom_Builder$ = this;
  this.buildFn$1 = new $c_sjsr_AnonFunction3().init___sjs_js_Function3((function($this) {
    return (function(tag$2, props$2, children$2) {
      var tag = $as_T(tag$2);
      var jsx$1 = $g.React;
      return jsx$1.createElement.apply(jsx$1, [tag, props$2].concat(children$2))
    })
  })(this));
  return this
});
$c_Ljapgolly_scalajs_react_vdom_Builder$.prototype.set__sjs_js_Object__T__sjs_js_Any__V = (function(o, k, v) {
  o[k] = v
});
var $d_Ljapgolly_scalajs_react_vdom_Builder$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Builder$: 0
}, false, "japgolly.scalajs.react.vdom.Builder$", {
  Ljapgolly_scalajs_react_vdom_Builder$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_Builder$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Builder$;
var $n_Ljapgolly_scalajs_react_vdom_Builder$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_Builder$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_Builder$)) {
    $n_Ljapgolly_scalajs_react_vdom_Builder$ = new $c_Ljapgolly_scalajs_react_vdom_Builder$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_Builder$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_Exports() {
  $c_O.call(this);
  this.VdomNode$1 = null;
  this.VdomElement$1 = null;
  this.HtmlTagOf$1 = null;
  this.SvgTagOf$1 = null;
  this.TagMod$1 = null;
  this.EmptyVdom$1 = null;
  this.VdomAttr$1 = null;
  this.VdomStyle$1 = null;
  this.VdomArray$1 = null
}
$c_Ljapgolly_scalajs_react_vdom_Exports.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Exports.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Exports;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_Exports() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_Exports.prototype = $c_Ljapgolly_scalajs_react_vdom_Exports.prototype;
$c_Ljapgolly_scalajs_react_vdom_Exports.prototype.init___ = (function() {
  this.VdomNode$1 = $m_Ljapgolly_scalajs_react_vdom_VdomNode$();
  this.VdomElement$1 = $m_Ljapgolly_scalajs_react_vdom_VdomElement$();
  this.HtmlTagOf$1 = $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$();
  this.SvgTagOf$1 = $m_Ljapgolly_scalajs_react_vdom_SvgTagOf$();
  this.TagMod$1 = $m_Ljapgolly_scalajs_react_vdom_TagMod$();
  this.EmptyVdom$1 = $m_Ljapgolly_scalajs_react_vdom_TagMod$().Empty$1;
  this.VdomAttr$1 = $m_Ljapgolly_scalajs_react_vdom_Attr$();
  this.VdomStyle$1 = $m_Ljapgolly_scalajs_react_vdom_Style$();
  this.VdomArray$1 = $m_Ljapgolly_scalajs_react_vdom_VdomArray$();
  return this
});
function $f_Ljapgolly_scalajs_react_vdom_ImplicitsForVdomAttr__$$init$__V($thiz) {
  $thiz.vdomAttrVtBoolean$2 = $m_Ljapgolly_scalajs_react_vdom_Attr$ValueType$().byImplicit__F1__F2(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(value$2) {
      var value = $uZ(value$2);
      return value
    })
  })($thiz)));
  $thiz.vdomAttrVtString$2 = $m_Ljapgolly_scalajs_react_vdom_Attr$ValueType$().string$1;
  $thiz.vdomAttrVtInt$2 = $m_Ljapgolly_scalajs_react_vdom_Attr$ValueType$().byImplicit__F1__F2(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2) {
    return (function(value$3$2) {
      var value$3 = $uI(value$3$2);
      return value$3
    })
  })($thiz)));
  $thiz.vdomAttrVtJsObject$2 = $m_Ljapgolly_scalajs_react_vdom_Attr$ValueType$().direct$1
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_Style$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_vdom_Style$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Style$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Style$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_Style$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_Style$.prototype = $c_Ljapgolly_scalajs_react_vdom_Style$.prototype;
$c_Ljapgolly_scalajs_react_vdom_Style$.prototype.init___ = (function() {
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_Style$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Style$: 0
}, false, "japgolly.scalajs.react.vdom.Style$", {
  Ljapgolly_scalajs_react_vdom_Style$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_Style$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Style$;
var $n_Ljapgolly_scalajs_react_vdom_Style$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_Style$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_Style$)) {
    $n_Ljapgolly_scalajs_react_vdom_Style$ = new $c_Ljapgolly_scalajs_react_vdom_Style$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_Style$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_TagMod$() {
  $c_O.call(this);
  this.Empty$1 = null
}
$c_Ljapgolly_scalajs_react_vdom_TagMod$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_TagMod$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_TagMod$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_TagMod$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_TagMod$.prototype = $c_Ljapgolly_scalajs_react_vdom_TagMod$.prototype;
$c_Ljapgolly_scalajs_react_vdom_TagMod$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_vdom_TagMod$ = this;
  this.Empty$1 = new $c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$2().init___();
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_TagMod$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_TagMod$: 0
}, false, "japgolly.scalajs.react.vdom.TagMod$", {
  Ljapgolly_scalajs_react_vdom_TagMod$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_TagMod$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_TagMod$;
var $n_Ljapgolly_scalajs_react_vdom_TagMod$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_TagMod$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_TagMod$)) {
    $n_Ljapgolly_scalajs_react_vdom_TagMod$ = new $c_Ljapgolly_scalajs_react_vdom_TagMod$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_TagMod$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_VdomArray$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_vdom_VdomArray$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_VdomArray$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_VdomArray$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_VdomArray$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_VdomArray$.prototype = $c_Ljapgolly_scalajs_react_vdom_VdomArray$.prototype;
$c_Ljapgolly_scalajs_react_vdom_VdomArray$.prototype.init___ = (function() {
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_VdomArray$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_VdomArray$: 0
}, false, "japgolly.scalajs.react.vdom.VdomArray$", {
  Ljapgolly_scalajs_react_vdom_VdomArray$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_VdomArray$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_VdomArray$;
var $n_Ljapgolly_scalajs_react_vdom_VdomArray$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_VdomArray$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_VdomArray$)) {
    $n_Ljapgolly_scalajs_react_vdom_VdomArray$ = new $c_Ljapgolly_scalajs_react_vdom_VdomArray$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_VdomArray$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_VdomElement$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_vdom_VdomElement$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_VdomElement$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_VdomElement$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_VdomElement$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_VdomElement$.prototype = $c_Ljapgolly_scalajs_react_vdom_VdomElement$.prototype;
$c_Ljapgolly_scalajs_react_vdom_VdomElement$.prototype.init___ = (function() {
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_VdomElement$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_VdomElement$: 0
}, false, "japgolly.scalajs.react.vdom.VdomElement$", {
  Ljapgolly_scalajs_react_vdom_VdomElement$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_VdomElement$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_VdomElement$;
var $n_Ljapgolly_scalajs_react_vdom_VdomElement$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_VdomElement$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_VdomElement$)) {
    $n_Ljapgolly_scalajs_react_vdom_VdomElement$ = new $c_Ljapgolly_scalajs_react_vdom_VdomElement$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_VdomElement$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_VdomNode$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_vdom_VdomNode$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_VdomNode$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_VdomNode$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_VdomNode$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_VdomNode$.prototype = $c_Ljapgolly_scalajs_react_vdom_VdomNode$.prototype;
$c_Ljapgolly_scalajs_react_vdom_VdomNode$.prototype.init___ = (function() {
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_VdomNode$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_VdomNode$: 0
}, false, "japgolly.scalajs.react.vdom.VdomNode$", {
  Ljapgolly_scalajs_react_vdom_VdomNode$: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_VdomNode$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_VdomNode$;
var $n_Ljapgolly_scalajs_react_vdom_VdomNode$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_VdomNode$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_VdomNode$)) {
    $n_Ljapgolly_scalajs_react_vdom_VdomNode$ = new $c_Ljapgolly_scalajs_react_vdom_VdomNode$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_VdomNode$
}
/** @constructor */
function $c_Lorg_scalajs_dom_package$() {
  $c_O.call(this);
  this.ApplicationCache$1 = null;
  this.Blob$1 = null;
  this.BlobPropertyBag$1 = null;
  this.ClipboardEventInit$1 = null;
  this.DOMException$1 = null;
  this.Event$1 = null;
  this.EventException$1 = null;
  this.EventSource$1 = null;
  this.FileReader$1 = null;
  this.FormData$1 = null;
  this.KeyboardEvent$1 = null;
  this.MediaError$1 = null;
  this.MutationEvent$1 = null;
  this.MutationObserverInit$1 = null;
  this.Node$1 = null;
  this.NodeFilter$1 = null;
  this.PerformanceNavigation$1 = null;
  this.PositionError$1 = null;
  this.Range$1 = null;
  this.TextEvent$1 = null;
  this.TextTrack$1 = null;
  this.URL$1 = null;
  this.VisibilityState$1 = null;
  this.WebSocket$1 = null;
  this.WheelEvent$1 = null;
  this.XMLHttpRequest$1 = null;
  this.XPathResult$1 = null;
  this.window$1 = null;
  this.document$1 = null;
  this.console$1 = null;
  this.bitmap$0$1 = 0
}
$c_Lorg_scalajs_dom_package$.prototype = new $h_O();
$c_Lorg_scalajs_dom_package$.prototype.constructor = $c_Lorg_scalajs_dom_package$;
/** @constructor */
function $h_Lorg_scalajs_dom_package$() {
  /*<skip>*/
}
$h_Lorg_scalajs_dom_package$.prototype = $c_Lorg_scalajs_dom_package$.prototype;
$c_Lorg_scalajs_dom_package$.prototype.init___ = (function() {
  return this
});
$c_Lorg_scalajs_dom_package$.prototype.console$lzycompute__p1__Lorg_scalajs_dom_raw_Console = (function() {
  if (((536870912 & this.bitmap$0$1) === 0)) {
    this.console$1 = this.window__Lorg_scalajs_dom_raw_Window().console;
    this.bitmap$0$1 = (536870912 | this.bitmap$0$1)
  };
  return this.console$1
});
$c_Lorg_scalajs_dom_package$.prototype.document__Lorg_scalajs_dom_raw_HTMLDocument = (function() {
  return (((268435456 & this.bitmap$0$1) === 0) ? this.document$lzycompute__p1__Lorg_scalajs_dom_raw_HTMLDocument() : this.document$1)
});
$c_Lorg_scalajs_dom_package$.prototype.window__Lorg_scalajs_dom_raw_Window = (function() {
  return (((134217728 & this.bitmap$0$1) === 0) ? this.window$lzycompute__p1__Lorg_scalajs_dom_raw_Window() : this.window$1)
});
$c_Lorg_scalajs_dom_package$.prototype.window$lzycompute__p1__Lorg_scalajs_dom_raw_Window = (function() {
  if (((134217728 & this.bitmap$0$1) === 0)) {
    this.window$1 = $g;
    this.bitmap$0$1 = (134217728 | this.bitmap$0$1)
  };
  return this.window$1
});
$c_Lorg_scalajs_dom_package$.prototype.document$lzycompute__p1__Lorg_scalajs_dom_raw_HTMLDocument = (function() {
  if (((268435456 & this.bitmap$0$1) === 0)) {
    this.document$1 = this.window__Lorg_scalajs_dom_raw_Window().document;
    this.bitmap$0$1 = (268435456 | this.bitmap$0$1)
  };
  return this.document$1
});
$c_Lorg_scalajs_dom_package$.prototype.console__Lorg_scalajs_dom_raw_Console = (function() {
  return (((536870912 & this.bitmap$0$1) === 0) ? this.console$lzycompute__p1__Lorg_scalajs_dom_raw_Console() : this.console$1)
});
var $d_Lorg_scalajs_dom_package$ = new $TypeData().initClass({
  Lorg_scalajs_dom_package$: 0
}, false, "org.scalajs.dom.package$", {
  Lorg_scalajs_dom_package$: 1,
  O: 1
});
$c_Lorg_scalajs_dom_package$.prototype.$classData = $d_Lorg_scalajs_dom_package$;
var $n_Lorg_scalajs_dom_package$ = (void 0);
function $m_Lorg_scalajs_dom_package$() {
  if ((!$n_Lorg_scalajs_dom_package$)) {
    $n_Lorg_scalajs_dom_package$ = new $c_Lorg_scalajs_dom_package$().init___()
  };
  return $n_Lorg_scalajs_dom_package$
}
/** @constructor */
function $c_jl_Class() {
  $c_O.call(this);
  this.data$1 = null
}
$c_jl_Class.prototype = new $h_O();
$c_jl_Class.prototype.constructor = $c_jl_Class;
/** @constructor */
function $h_jl_Class() {
  /*<skip>*/
}
$h_jl_Class.prototype = $c_jl_Class.prototype;
$c_jl_Class.prototype.getName__T = (function() {
  return $as_T(this.data$1.name)
});
$c_jl_Class.prototype.isPrimitive__Z = (function() {
  return $uZ(this.data$1.isPrimitive)
});
$c_jl_Class.prototype.toString__T = (function() {
  return ((this.isInterface__Z() ? "interface " : (this.isPrimitive__Z() ? "" : "class ")) + this.getName__T())
});
$c_jl_Class.prototype.isAssignableFrom__jl_Class__Z = (function(that) {
  return ((this.isPrimitive__Z() || that.isPrimitive__Z()) ? ((this === that) || ((this === $d_S.getClassOf()) ? (that === $d_B.getClassOf()) : ((this === $d_I.getClassOf()) ? ((that === $d_B.getClassOf()) || (that === $d_S.getClassOf())) : ((this === $d_F.getClassOf()) ? (((that === $d_B.getClassOf()) || (that === $d_S.getClassOf())) || (that === $d_I.getClassOf())) : ((this === $d_D.getClassOf()) && ((((that === $d_B.getClassOf()) || (that === $d_S.getClassOf())) || (that === $d_I.getClassOf())) || (that === $d_F.getClassOf()))))))) : this.isInstance__O__Z(that.getFakeInstance__p1__O()))
});
$c_jl_Class.prototype.isInstance__O__Z = (function(obj) {
  return $uZ(this.data$1.isInstance(obj))
});
$c_jl_Class.prototype.getFakeInstance__p1__O = (function() {
  return this.data$1.getFakeInstance()
});
$c_jl_Class.prototype.init___jl_ScalaJSClassData = (function(data) {
  this.data$1 = data;
  return this
});
$c_jl_Class.prototype.isArray__Z = (function() {
  return $uZ(this.data$1.isArrayClass)
});
$c_jl_Class.prototype.isInterface__Z = (function() {
  return $uZ(this.data$1.isInterface)
});
var $d_jl_Class = new $TypeData().initClass({
  jl_Class: 0
}, false, "java.lang.Class", {
  jl_Class: 1,
  O: 1
});
$c_jl_Class.prototype.$classData = $d_jl_Class;
/** @constructor */
function $c_jl_Long$StringRadixInfo() {
  $c_O.call(this);
  this.chunkLength$1 = 0;
  this.radixPowLength$1 = $m_sjsr_RuntimeLong$().Zero__sjsr_RuntimeLong();
  this.paddingZeros$1 = null;
  this.overflowBarrier$1 = $m_sjsr_RuntimeLong$().Zero__sjsr_RuntimeLong()
}
$c_jl_Long$StringRadixInfo.prototype = new $h_O();
$c_jl_Long$StringRadixInfo.prototype.constructor = $c_jl_Long$StringRadixInfo;
/** @constructor */
function $h_jl_Long$StringRadixInfo() {
  /*<skip>*/
}
$h_jl_Long$StringRadixInfo.prototype = $c_jl_Long$StringRadixInfo.prototype;
$c_jl_Long$StringRadixInfo.prototype.init___I__J__T__J = (function(chunkLength, radixPowLength, paddingZeros, overflowBarrier) {
  this.chunkLength$1 = chunkLength;
  this.radixPowLength$1 = radixPowLength;
  this.paddingZeros$1 = paddingZeros;
  this.overflowBarrier$1 = overflowBarrier;
  return this
});
function $is_jl_Long$StringRadixInfo(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Long$StringRadixInfo)))
}
function $as_jl_Long$StringRadixInfo(obj) {
  return (($is_jl_Long$StringRadixInfo(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Long$StringRadixInfo"))
}
function $isArrayOf_jl_Long$StringRadixInfo(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Long$StringRadixInfo)))
}
function $asArrayOf_jl_Long$StringRadixInfo(obj, depth) {
  return (($isArrayOf_jl_Long$StringRadixInfo(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Long$StringRadixInfo;", depth))
}
var $d_jl_Long$StringRadixInfo = new $TypeData().initClass({
  jl_Long$StringRadixInfo: 0
}, false, "java.lang.Long$StringRadixInfo", {
  jl_Long$StringRadixInfo: 1,
  O: 1
});
$c_jl_Long$StringRadixInfo.prototype.$classData = $d_jl_Long$StringRadixInfo;
/** @constructor */
function $c_s_FallbackArrayBuilding() {
  $c_O.call(this)
}
$c_s_FallbackArrayBuilding.prototype = new $h_O();
$c_s_FallbackArrayBuilding.prototype.constructor = $c_s_FallbackArrayBuilding;
/** @constructor */
function $h_s_FallbackArrayBuilding() {
  /*<skip>*/
}
$h_s_FallbackArrayBuilding.prototype = $c_s_FallbackArrayBuilding.prototype;
/** @constructor */
function $c_s_LowPriorityImplicits() {
  $c_O.call(this)
}
$c_s_LowPriorityImplicits.prototype = new $h_O();
$c_s_LowPriorityImplicits.prototype.constructor = $c_s_LowPriorityImplicits;
/** @constructor */
function $h_s_LowPriorityImplicits() {
  /*<skip>*/
}
$h_s_LowPriorityImplicits.prototype = $c_s_LowPriorityImplicits.prototype;
function $f_s_PartialFunction__applyOrElse__O__F1__O($thiz, x, $default) {
  return ($thiz.isDefinedAt__O__Z(x) ? $thiz.apply__O__O(x) : $default.apply__O__O(x))
}
/** @constructor */
function $c_s_PartialFunction$() {
  $c_O.call(this);
  this.scala$PartialFunction$$fallback$undpf$f = null;
  this.scala$PartialFunction$$constFalse$f = null;
  this.empty$undpf$1 = null
}
$c_s_PartialFunction$.prototype = new $h_O();
$c_s_PartialFunction$.prototype.constructor = $c_s_PartialFunction$;
/** @constructor */
function $h_s_PartialFunction$() {
  /*<skip>*/
}
$h_s_PartialFunction$.prototype = $c_s_PartialFunction$.prototype;
$c_s_PartialFunction$.prototype.init___ = (function() {
  $n_s_PartialFunction$ = this;
  this.scala$PartialFunction$$fallback$undpf$f = new $c_s_PartialFunction$$anonfun$1().init___();
  this.scala$PartialFunction$$constFalse$f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$1$2) {
      return false
    })
  })(this));
  this.empty$undpf$1 = new $c_s_PartialFunction$$anon$1().init___();
  return this
});
$c_s_PartialFunction$.prototype.scala$PartialFunction$$fallbackOccurred__O__Z = (function(x) {
  return (this.scala$PartialFunction$$fallback$undpf$f === x)
});
var $d_s_PartialFunction$ = new $TypeData().initClass({
  s_PartialFunction$: 0
}, false, "scala.PartialFunction$", {
  s_PartialFunction$: 1,
  O: 1
});
$c_s_PartialFunction$.prototype.$classData = $d_s_PartialFunction$;
var $n_s_PartialFunction$ = (void 0);
function $m_s_PartialFunction$() {
  if ((!$n_s_PartialFunction$)) {
    $n_s_PartialFunction$ = new $c_s_PartialFunction$().init___()
  };
  return $n_s_PartialFunction$
}
/** @constructor */
function $c_s_math_Ordered$() {
  $c_O.call(this)
}
$c_s_math_Ordered$.prototype = new $h_O();
$c_s_math_Ordered$.prototype.constructor = $c_s_math_Ordered$;
/** @constructor */
function $h_s_math_Ordered$() {
  /*<skip>*/
}
$h_s_math_Ordered$.prototype = $c_s_math_Ordered$.prototype;
$c_s_math_Ordered$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Ordered$ = new $TypeData().initClass({
  s_math_Ordered$: 0
}, false, "scala.math.Ordered$", {
  s_math_Ordered$: 1,
  O: 1
});
$c_s_math_Ordered$.prototype.$classData = $d_s_math_Ordered$;
var $n_s_math_Ordered$ = (void 0);
function $m_s_math_Ordered$() {
  if ((!$n_s_math_Ordered$)) {
    $n_s_math_Ordered$ = new $c_s_math_Ordered$().init___()
  };
  return $n_s_math_Ordered$
}
/** @constructor */
function $c_s_package$() {
  $c_O.call(this);
  this.BigDecimal$1 = null;
  this.BigInt$1 = null;
  this.AnyRef$1 = null;
  this.Traversable$1 = null;
  this.Iterable$1 = null;
  this.Seq$1 = null;
  this.IndexedSeq$1 = null;
  this.Iterator$1 = null;
  this.List$1 = null;
  this.Nil$1 = null;
  this.$$colon$colon$1 = null;
  this.$$plus$colon$1 = null;
  this.$$colon$plus$1 = null;
  this.Stream$1 = null;
  this.$$hash$colon$colon$1 = null;
  this.Vector$1 = null;
  this.StringBuilder$1 = null;
  this.Range$1 = null;
  this.Equiv$1 = null;
  this.Fractional$1 = null;
  this.Integral$1 = null;
  this.Numeric$1 = null;
  this.Ordered$1 = null;
  this.Ordering$1 = null;
  this.Either$1 = null;
  this.Left$1 = null;
  this.Right$1 = null;
  this.bitmap$0$1 = 0
}
$c_s_package$.prototype = new $h_O();
$c_s_package$.prototype.constructor = $c_s_package$;
/** @constructor */
function $h_s_package$() {
  /*<skip>*/
}
$h_s_package$.prototype = $c_s_package$.prototype;
$c_s_package$.prototype.init___ = (function() {
  $n_s_package$ = this;
  this.AnyRef$1 = new $c_s_package$$anon$1().init___();
  this.Traversable$1 = $m_sc_Traversable$();
  this.Iterable$1 = $m_sc_Iterable$();
  this.Seq$1 = $m_sc_Seq$();
  this.IndexedSeq$1 = $m_sc_IndexedSeq$();
  this.Iterator$1 = $m_sc_Iterator$();
  this.List$1 = $m_sci_List$();
  this.Nil$1 = $m_sci_Nil$();
  this.$$colon$colon$1 = $m_sci_$colon$colon$();
  this.$$plus$colon$1 = $m_sc_$plus$colon$();
  this.$$colon$plus$1 = $m_sc_$colon$plus$();
  this.Stream$1 = $m_sci_Stream$();
  this.$$hash$colon$colon$1 = $m_sci_Stream$$hash$colon$colon$();
  this.Vector$1 = $m_sci_Vector$();
  this.StringBuilder$1 = $m_scm_StringBuilder$();
  this.Range$1 = $m_sci_Range$();
  this.Equiv$1 = $m_s_math_Equiv$();
  this.Fractional$1 = $m_s_math_Fractional$();
  this.Integral$1 = $m_s_math_Integral$();
  this.Numeric$1 = $m_s_math_Numeric$();
  this.Ordered$1 = $m_s_math_Ordered$();
  this.Ordering$1 = $m_s_math_Ordering$();
  this.Either$1 = $m_s_util_Either$();
  this.Left$1 = $m_s_util_Left$();
  this.Right$1 = $m_s_util_Right$();
  return this
});
var $d_s_package$ = new $TypeData().initClass({
  s_package$: 0
}, false, "scala.package$", {
  s_package$: 1,
  O: 1
});
$c_s_package$.prototype.$classData = $d_s_package$;
var $n_s_package$ = (void 0);
function $m_s_package$() {
  if ((!$n_s_package$)) {
    $n_s_package$ = new $c_s_package$().init___()
  };
  return $n_s_package$
}
/** @constructor */
function $c_s_reflect_ClassManifestFactory$() {
  $c_O.call(this);
  this.Byte$1 = null;
  this.Short$1 = null;
  this.Char$1 = null;
  this.Int$1 = null;
  this.Long$1 = null;
  this.Float$1 = null;
  this.Double$1 = null;
  this.Boolean$1 = null;
  this.Unit$1 = null;
  this.Any$1 = null;
  this.Object$1 = null;
  this.AnyVal$1 = null;
  this.Nothing$1 = null;
  this.Null$1 = null
}
$c_s_reflect_ClassManifestFactory$.prototype = new $h_O();
$c_s_reflect_ClassManifestFactory$.prototype.constructor = $c_s_reflect_ClassManifestFactory$;
/** @constructor */
function $h_s_reflect_ClassManifestFactory$() {
  /*<skip>*/
}
$h_s_reflect_ClassManifestFactory$.prototype = $c_s_reflect_ClassManifestFactory$.prototype;
$c_s_reflect_ClassManifestFactory$.prototype.init___ = (function() {
  $n_s_reflect_ClassManifestFactory$ = this;
  this.Byte$1 = $m_s_reflect_ManifestFactory$ByteManifest$();
  this.Short$1 = $m_s_reflect_ManifestFactory$ShortManifest$();
  this.Char$1 = $m_s_reflect_ManifestFactory$CharManifest$();
  this.Int$1 = $m_s_reflect_ManifestFactory$IntManifest$();
  this.Long$1 = $m_s_reflect_ManifestFactory$LongManifest$();
  this.Float$1 = $m_s_reflect_ManifestFactory$FloatManifest$();
  this.Double$1 = $m_s_reflect_ManifestFactory$DoubleManifest$();
  this.Boolean$1 = $m_s_reflect_ManifestFactory$BooleanManifest$();
  this.Unit$1 = $m_s_reflect_ManifestFactory$UnitManifest$();
  this.Any$1 = $m_s_reflect_ManifestFactory$AnyManifest$();
  this.Object$1 = $m_s_reflect_ManifestFactory$ObjectManifest$();
  this.AnyVal$1 = $m_s_reflect_ManifestFactory$AnyValManifest$();
  this.Nothing$1 = $m_s_reflect_ManifestFactory$NothingManifest$();
  this.Null$1 = $m_s_reflect_ManifestFactory$NullManifest$();
  return this
});
var $d_s_reflect_ClassManifestFactory$ = new $TypeData().initClass({
  s_reflect_ClassManifestFactory$: 0
}, false, "scala.reflect.ClassManifestFactory$", {
  s_reflect_ClassManifestFactory$: 1,
  O: 1
});
$c_s_reflect_ClassManifestFactory$.prototype.$classData = $d_s_reflect_ClassManifestFactory$;
var $n_s_reflect_ClassManifestFactory$ = (void 0);
function $m_s_reflect_ClassManifestFactory$() {
  if ((!$n_s_reflect_ClassManifestFactory$)) {
    $n_s_reflect_ClassManifestFactory$ = new $c_s_reflect_ClassManifestFactory$().init___()
  };
  return $n_s_reflect_ClassManifestFactory$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$() {
  $c_O.call(this)
}
$c_s_reflect_ManifestFactory$.prototype = new $h_O();
$c_s_reflect_ManifestFactory$.prototype.constructor = $c_s_reflect_ManifestFactory$;
/** @constructor */
function $h_s_reflect_ManifestFactory$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$.prototype = $c_s_reflect_ManifestFactory$.prototype;
$c_s_reflect_ManifestFactory$.prototype.init___ = (function() {
  return this
});
var $d_s_reflect_ManifestFactory$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$: 0
}, false, "scala.reflect.ManifestFactory$", {
  s_reflect_ManifestFactory$: 1,
  O: 1
});
$c_s_reflect_ManifestFactory$.prototype.$classData = $d_s_reflect_ManifestFactory$;
var $n_s_reflect_ManifestFactory$ = (void 0);
function $m_s_reflect_ManifestFactory$() {
  if ((!$n_s_reflect_ManifestFactory$)) {
    $n_s_reflect_ManifestFactory$ = new $c_s_reflect_ManifestFactory$().init___()
  };
  return $n_s_reflect_ManifestFactory$
}
/** @constructor */
function $c_s_reflect_package$() {
  $c_O.call(this);
  this.ClassManifest$1 = null;
  this.Manifest$1 = null
}
$c_s_reflect_package$.prototype = new $h_O();
$c_s_reflect_package$.prototype.constructor = $c_s_reflect_package$;
/** @constructor */
function $h_s_reflect_package$() {
  /*<skip>*/
}
$h_s_reflect_package$.prototype = $c_s_reflect_package$.prototype;
$c_s_reflect_package$.prototype.init___ = (function() {
  $n_s_reflect_package$ = this;
  this.ClassManifest$1 = $m_s_reflect_ClassManifestFactory$();
  this.Manifest$1 = $m_s_reflect_ManifestFactory$();
  return this
});
var $d_s_reflect_package$ = new $TypeData().initClass({
  s_reflect_package$: 0
}, false, "scala.reflect.package$", {
  s_reflect_package$: 1,
  O: 1
});
$c_s_reflect_package$.prototype.$classData = $d_s_reflect_package$;
var $n_s_reflect_package$ = (void 0);
function $m_s_reflect_package$() {
  if ((!$n_s_reflect_package$)) {
    $n_s_reflect_package$ = new $c_s_reflect_package$().init___()
  };
  return $n_s_reflect_package$
}
/** @constructor */
function $c_s_sys_package$() {
  $c_O.call(this)
}
$c_s_sys_package$.prototype = new $h_O();
$c_s_sys_package$.prototype.constructor = $c_s_sys_package$;
/** @constructor */
function $h_s_sys_package$() {
  /*<skip>*/
}
$h_s_sys_package$.prototype = $c_s_sys_package$.prototype;
$c_s_sys_package$.prototype.init___ = (function() {
  return this
});
$c_s_sys_package$.prototype.error__T__sr_Nothing$ = (function(message) {
  throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(new $c_jl_RuntimeException().init___T(message))
});
var $d_s_sys_package$ = new $TypeData().initClass({
  s_sys_package$: 0
}, false, "scala.sys.package$", {
  s_sys_package$: 1,
  O: 1
});
$c_s_sys_package$.prototype.$classData = $d_s_sys_package$;
var $n_s_sys_package$ = (void 0);
function $m_s_sys_package$() {
  if ((!$n_s_sys_package$)) {
    $n_s_sys_package$ = new $c_s_sys_package$().init___()
  };
  return $n_s_sys_package$
}
/** @constructor */
function $c_s_util_control_Breaks() {
  $c_O.call(this);
  this.scala$util$control$Breaks$$breakException$1 = null
}
$c_s_util_control_Breaks.prototype = new $h_O();
$c_s_util_control_Breaks.prototype.constructor = $c_s_util_control_Breaks;
/** @constructor */
function $h_s_util_control_Breaks() {
  /*<skip>*/
}
$h_s_util_control_Breaks.prototype = $c_s_util_control_Breaks.prototype;
$c_s_util_control_Breaks.prototype.init___ = (function() {
  this.scala$util$control$Breaks$$breakException$1 = new $c_s_util_control_BreakControl().init___();
  return this
});
var $d_s_util_control_Breaks = new $TypeData().initClass({
  s_util_control_Breaks: 0
}, false, "scala.util.control.Breaks", {
  s_util_control_Breaks: 1,
  O: 1
});
$c_s_util_control_Breaks.prototype.$classData = $d_s_util_control_Breaks;
/** @constructor */
function $c_s_util_hashing_MurmurHash3() {
  $c_O.call(this)
}
$c_s_util_hashing_MurmurHash3.prototype = new $h_O();
$c_s_util_hashing_MurmurHash3.prototype.constructor = $c_s_util_hashing_MurmurHash3;
/** @constructor */
function $h_s_util_hashing_MurmurHash3() {
  /*<skip>*/
}
$h_s_util_hashing_MurmurHash3.prototype = $c_s_util_hashing_MurmurHash3.prototype;
$c_s_util_hashing_MurmurHash3.prototype.mixLast__I__I__I = (function(hash, data) {
  var k = data;
  k = $imul((-862048943), k);
  var i = k;
  k = ((i << 15) | ((i >>> 17) | 0));
  k = $imul(461845907, k);
  return (hash ^ k)
});
$c_s_util_hashing_MurmurHash3.prototype.mix__I__I__I = (function(hash, data) {
  var h = this.mixLast__I__I__I(hash, data);
  var i = h;
  h = ((i << 13) | ((i >>> 19) | 0));
  return (((-430675100) + $imul(5, h)) | 0)
});
$c_s_util_hashing_MurmurHash3.prototype.avalanche__p1__I__I = (function(hash) {
  var h = hash;
  h = (h ^ ((h >>> 16) | 0));
  h = $imul((-2048144789), h);
  h = (h ^ ((h >>> 13) | 0));
  h = $imul((-1028477387), h);
  h = (h ^ ((h >>> 16) | 0));
  return h
});
$c_s_util_hashing_MurmurHash3.prototype.unorderedHash__sc_TraversableOnce__I__I = (function(xs, seed) {
  var a = new $c_sr_IntRef().init___I(0);
  var b = new $c_sr_IntRef().init___I(0);
  var n = new $c_sr_IntRef().init___I(0);
  var c = new $c_sr_IntRef().init___I(1);
  xs.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, a$1, b$1, n$1, c$1) {
    return (function(x$2) {
      var h = $m_sr_Statics$().anyHash__O__I(x$2);
      a$1.elem$1 = ((a$1.elem$1 + h) | 0);
      b$1.elem$1 = (b$1.elem$1 ^ h);
      if ((h !== 0)) {
        c$1.elem$1 = $imul(c$1.elem$1, h)
      };
      n$1.elem$1 = ((1 + n$1.elem$1) | 0)
    })
  })(this, a, b, n, c)));
  var h$1 = seed;
  h$1 = this.mix__I__I__I(h$1, a.elem$1);
  h$1 = this.mix__I__I__I(h$1, b.elem$1);
  h$1 = this.mixLast__I__I__I(h$1, c.elem$1);
  return this.finalizeHash__I__I__I(h$1, n.elem$1)
});
$c_s_util_hashing_MurmurHash3.prototype.productHash__s_Product__I__I = (function(x, seed) {
  var arr = x.productArity__I();
  if ((arr === 0)) {
    var this$1 = x.productPrefix__T();
    return $m_sjsr_RuntimeString$().hashCode__T__I(this$1)
  } else {
    var h = seed;
    var i = 0;
    while ((i < arr)) {
      h = this.mix__I__I__I(h, $m_sr_Statics$().anyHash__O__I(x.productElement__I__O(i)));
      i = ((1 + i) | 0)
    };
    return this.finalizeHash__I__I__I(h, arr)
  }
});
$c_s_util_hashing_MurmurHash3.prototype.finalizeHash__I__I__I = (function(hash, length) {
  return this.avalanche__p1__I__I((hash ^ length))
});
$c_s_util_hashing_MurmurHash3.prototype.orderedHash__sc_TraversableOnce__I__I = (function(xs, seed) {
  var n = new $c_sr_IntRef().init___I(0);
  var h = new $c_sr_IntRef().init___I(seed);
  xs.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, n$1, h$1) {
    return (function(x$2) {
      h$1.elem$1 = $this.mix__I__I__I(h$1.elem$1, $m_sr_Statics$().anyHash__O__I(x$2));
      n$1.elem$1 = ((1 + n$1.elem$1) | 0)
    })
  })(this, n, h)));
  return this.finalizeHash__I__I__I(h.elem$1, n.elem$1)
});
$c_s_util_hashing_MurmurHash3.prototype.listHash__sci_List__I__I = (function(xs, seed) {
  var n = 0;
  var h = seed;
  var elems = xs;
  while ((!elems.isEmpty__Z())) {
    var head = elems.head__O();
    var this$1 = elems;
    var tail = this$1.tail__sci_List();
    h = this.mix__I__I__I(h, $m_sr_Statics$().anyHash__O__I(head));
    n = ((1 + n) | 0);
    elems = tail
  };
  return this.finalizeHash__I__I__I(h, n)
});
/** @constructor */
function $c_sc_$colon$plus$() {
  $c_O.call(this)
}
$c_sc_$colon$plus$.prototype = new $h_O();
$c_sc_$colon$plus$.prototype.constructor = $c_sc_$colon$plus$;
/** @constructor */
function $h_sc_$colon$plus$() {
  /*<skip>*/
}
$h_sc_$colon$plus$.prototype = $c_sc_$colon$plus$.prototype;
$c_sc_$colon$plus$.prototype.init___ = (function() {
  return this
});
var $d_sc_$colon$plus$ = new $TypeData().initClass({
  sc_$colon$plus$: 0
}, false, "scala.collection.$colon$plus$", {
  sc_$colon$plus$: 1,
  O: 1
});
$c_sc_$colon$plus$.prototype.$classData = $d_sc_$colon$plus$;
var $n_sc_$colon$plus$ = (void 0);
function $m_sc_$colon$plus$() {
  if ((!$n_sc_$colon$plus$)) {
    $n_sc_$colon$plus$ = new $c_sc_$colon$plus$().init___()
  };
  return $n_sc_$colon$plus$
}
/** @constructor */
function $c_sc_$plus$colon$() {
  $c_O.call(this)
}
$c_sc_$plus$colon$.prototype = new $h_O();
$c_sc_$plus$colon$.prototype.constructor = $c_sc_$plus$colon$;
/** @constructor */
function $h_sc_$plus$colon$() {
  /*<skip>*/
}
$h_sc_$plus$colon$.prototype = $c_sc_$plus$colon$.prototype;
$c_sc_$plus$colon$.prototype.init___ = (function() {
  return this
});
var $d_sc_$plus$colon$ = new $TypeData().initClass({
  sc_$plus$colon$: 0
}, false, "scala.collection.$plus$colon$", {
  sc_$plus$colon$: 1,
  O: 1
});
$c_sc_$plus$colon$.prototype.$classData = $d_sc_$plus$colon$;
var $n_sc_$plus$colon$ = (void 0);
function $m_sc_$plus$colon$() {
  if ((!$n_sc_$plus$colon$)) {
    $n_sc_$plus$colon$ = new $c_sc_$plus$colon$().init___()
  };
  return $n_sc_$plus$colon$
}
/** @constructor */
function $c_sc_Iterator$() {
  $c_O.call(this);
  this.empty$1 = null
}
$c_sc_Iterator$.prototype = new $h_O();
$c_sc_Iterator$.prototype.constructor = $c_sc_Iterator$;
/** @constructor */
function $h_sc_Iterator$() {
  /*<skip>*/
}
$h_sc_Iterator$.prototype = $c_sc_Iterator$.prototype;
$c_sc_Iterator$.prototype.init___ = (function() {
  $n_sc_Iterator$ = this;
  this.empty$1 = new $c_sc_Iterator$$anon$2().init___();
  return this
});
var $d_sc_Iterator$ = new $TypeData().initClass({
  sc_Iterator$: 0
}, false, "scala.collection.Iterator$", {
  sc_Iterator$: 1,
  O: 1
});
$c_sc_Iterator$.prototype.$classData = $d_sc_Iterator$;
var $n_sc_Iterator$ = (void 0);
function $m_sc_Iterator$() {
  if ((!$n_sc_Iterator$)) {
    $n_sc_Iterator$ = new $c_sc_Iterator$().init___()
  };
  return $n_sc_Iterator$
}
function $f_sc_TraversableOnce__mkString__T__T__T__T($thiz, start, sep, end) {
  var this$1 = $thiz.addString__scm_StringBuilder__T__T__T__scm_StringBuilder(new $c_scm_StringBuilder().init___(), start, sep, end);
  var this$2 = this$1.underlying$5;
  return this$2.content$1
}
function $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder($thiz, b, start, sep, end) {
  var first = new $c_sr_BooleanRef().init___Z(true);
  b.append__T__scm_StringBuilder(start);
  $thiz.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, b$1, sep$1, first$1) {
    return (function(x$2) {
      if (first$1.elem$1) {
        b$1.append__O__scm_StringBuilder(x$2);
        first$1.elem$1 = false;
        return (void 0)
      } else {
        b$1.append__T__scm_StringBuilder(sep$1);
        return b$1.append__O__scm_StringBuilder(x$2)
      }
    })
  })($thiz, b, sep, first)));
  b.append__T__scm_StringBuilder(end);
  return b
}
function $f_sc_TraversableOnce__nonEmpty__Z($thiz) {
  return (!$thiz.isEmpty__Z())
}
function $is_sc_TraversableOnce(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_TraversableOnce)))
}
function $as_sc_TraversableOnce(obj) {
  return (($is_sc_TraversableOnce(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.TraversableOnce"))
}
function $isArrayOf_sc_TraversableOnce(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_TraversableOnce)))
}
function $asArrayOf_sc_TraversableOnce(obj, depth) {
  return (($isArrayOf_sc_TraversableOnce(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.TraversableOnce;", depth))
}
/** @constructor */
function $c_scg_GenMapFactory() {
  $c_O.call(this)
}
$c_scg_GenMapFactory.prototype = new $h_O();
$c_scg_GenMapFactory.prototype.constructor = $c_scg_GenMapFactory;
/** @constructor */
function $h_scg_GenMapFactory() {
  /*<skip>*/
}
$h_scg_GenMapFactory.prototype = $c_scg_GenMapFactory.prototype;
/** @constructor */
function $c_scg_GenericCompanion() {
  $c_O.call(this)
}
$c_scg_GenericCompanion.prototype = new $h_O();
$c_scg_GenericCompanion.prototype.constructor = $c_scg_GenericCompanion;
/** @constructor */
function $h_scg_GenericCompanion() {
  /*<skip>*/
}
$h_scg_GenericCompanion.prototype = $c_scg_GenericCompanion.prototype;
function $f_scg_Growable__loop$1__pscg_Growable__sc_LinearSeq__V($thiz, xs) {
  _loop: while (true) {
    var this$1 = xs;
    if ($f_sc_TraversableOnce__nonEmpty__Z(this$1)) {
      $thiz.$$plus$eq__O__scg_Growable(xs.head__O());
      xs = $as_sc_LinearSeq(xs.tail__O());
      continue _loop
    };
    break
  }
}
function $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable($thiz, xs) {
  if ($is_sc_LinearSeq(xs)) {
    var x2 = $as_sc_LinearSeq(xs);
    var xs$1 = x2;
    $f_scg_Growable__loop$1__pscg_Growable__sc_LinearSeq__V($thiz, xs$1)
  } else {
    xs.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
      return (function(elem$2) {
        return $this.$$plus$eq__O__scg_Growable(elem$2)
      })
    })($thiz)))
  };
  return $thiz
}
/** @constructor */
function $c_sci_Stream$$hash$colon$colon$() {
  $c_O.call(this)
}
$c_sci_Stream$$hash$colon$colon$.prototype = new $h_O();
$c_sci_Stream$$hash$colon$colon$.prototype.constructor = $c_sci_Stream$$hash$colon$colon$;
/** @constructor */
function $h_sci_Stream$$hash$colon$colon$() {
  /*<skip>*/
}
$h_sci_Stream$$hash$colon$colon$.prototype = $c_sci_Stream$$hash$colon$colon$.prototype;
$c_sci_Stream$$hash$colon$colon$.prototype.init___ = (function() {
  return this
});
var $d_sci_Stream$$hash$colon$colon$ = new $TypeData().initClass({
  sci_Stream$$hash$colon$colon$: 0
}, false, "scala.collection.immutable.Stream$$hash$colon$colon$", {
  sci_Stream$$hash$colon$colon$: 1,
  O: 1
});
$c_sci_Stream$$hash$colon$colon$.prototype.$classData = $d_sci_Stream$$hash$colon$colon$;
var $n_sci_Stream$$hash$colon$colon$ = (void 0);
function $m_sci_Stream$$hash$colon$colon$() {
  if ((!$n_sci_Stream$$hash$colon$colon$)) {
    $n_sci_Stream$$hash$colon$colon$ = new $c_sci_Stream$$hash$colon$colon$().init___()
  };
  return $n_sci_Stream$$hash$colon$colon$
}
/** @constructor */
function $c_sci_StreamIterator$LazyCell() {
  $c_O.call(this);
  this.v$1 = null;
  this.st$1 = null;
  this.bitmap$0$1 = false;
  this.$$outer$1 = null
}
$c_sci_StreamIterator$LazyCell.prototype = new $h_O();
$c_sci_StreamIterator$LazyCell.prototype.constructor = $c_sci_StreamIterator$LazyCell;
/** @constructor */
function $h_sci_StreamIterator$LazyCell() {
  /*<skip>*/
}
$h_sci_StreamIterator$LazyCell.prototype = $c_sci_StreamIterator$LazyCell.prototype;
$c_sci_StreamIterator$LazyCell.prototype.init___sci_StreamIterator__F0 = (function($$outer, st) {
  this.st$1 = st;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
$c_sci_StreamIterator$LazyCell.prototype.v$lzycompute__p1__sci_Stream = (function() {
  if ((!this.bitmap$0$1)) {
    this.v$1 = $as_sci_Stream(this.st$1.apply__O());
    this.bitmap$0$1 = true
  };
  this.st$1 = null;
  return this.v$1
});
$c_sci_StreamIterator$LazyCell.prototype.v__sci_Stream = (function() {
  return ((!this.bitmap$0$1) ? this.v$lzycompute__p1__sci_Stream() : this.v$1)
});
var $d_sci_StreamIterator$LazyCell = new $TypeData().initClass({
  sci_StreamIterator$LazyCell: 0
}, false, "scala.collection.immutable.StreamIterator$LazyCell", {
  sci_StreamIterator$LazyCell: 1,
  O: 1
});
$c_sci_StreamIterator$LazyCell.prototype.$classData = $d_sci_StreamIterator$LazyCell;
/** @constructor */
function $c_sci_StringOps$() {
  $c_O.call(this)
}
$c_sci_StringOps$.prototype = new $h_O();
$c_sci_StringOps$.prototype.constructor = $c_sci_StringOps$;
/** @constructor */
function $h_sci_StringOps$() {
  /*<skip>*/
}
$h_sci_StringOps$.prototype = $c_sci_StringOps$.prototype;
$c_sci_StringOps$.prototype.init___ = (function() {
  return this
});
$c_sci_StringOps$.prototype.equals$extension__T__O__Z = (function($$this, x$1) {
  if ($is_sci_StringOps(x$1)) {
    var StringOps$1 = ((x$1 === null) ? null : $as_sci_StringOps(x$1).repr$1);
    return ($$this === StringOps$1)
  } else {
    return false
  }
});
var $d_sci_StringOps$ = new $TypeData().initClass({
  sci_StringOps$: 0
}, false, "scala.collection.immutable.StringOps$", {
  sci_StringOps$: 1,
  O: 1
});
$c_sci_StringOps$.prototype.$classData = $d_sci_StringOps$;
var $n_sci_StringOps$ = (void 0);
function $m_sci_StringOps$() {
  if ((!$n_sci_StringOps$)) {
    $n_sci_StringOps$ = new $c_sci_StringOps$().init___()
  };
  return $n_sci_StringOps$
}
/** @constructor */
function $c_sci_WrappedString$() {
  $c_O.call(this)
}
$c_sci_WrappedString$.prototype = new $h_O();
$c_sci_WrappedString$.prototype.constructor = $c_sci_WrappedString$;
/** @constructor */
function $h_sci_WrappedString$() {
  /*<skip>*/
}
$h_sci_WrappedString$.prototype = $c_sci_WrappedString$.prototype;
$c_sci_WrappedString$.prototype.init___ = (function() {
  return this
});
$c_sci_WrappedString$.prototype.newBuilder__scm_Builder = (function() {
  var this$2 = new $c_scm_StringBuilder().init___();
  var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$2) {
      var x = $as_T(x$2);
      return new $c_sci_WrappedString().init___T(x)
    })
  })(this));
  return new $c_scm_Builder$$anon$1().init___scm_Builder__F1(this$2, f)
});
var $d_sci_WrappedString$ = new $TypeData().initClass({
  sci_WrappedString$: 0
}, false, "scala.collection.immutable.WrappedString$", {
  sci_WrappedString$: 1,
  O: 1
});
$c_sci_WrappedString$.prototype.$classData = $d_sci_WrappedString$;
var $n_sci_WrappedString$ = (void 0);
function $m_sci_WrappedString$() {
  if ((!$n_sci_WrappedString$)) {
    $n_sci_WrappedString$ = new $c_sci_WrappedString$().init___()
  };
  return $n_sci_WrappedString$
}
/** @constructor */
function $c_sjsr_Bits$() {
  $c_O.call(this);
  this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f = false;
  this.arrayBuffer$1 = null;
  this.int32Array$1 = null;
  this.float32Array$1 = null;
  this.float64Array$1 = null;
  this.areTypedArraysBigEndian$1 = false;
  this.highOffset$1 = 0;
  this.lowOffset$1 = 0
}
$c_sjsr_Bits$.prototype = new $h_O();
$c_sjsr_Bits$.prototype.constructor = $c_sjsr_Bits$;
/** @constructor */
function $h_sjsr_Bits$() {
  /*<skip>*/
}
$h_sjsr_Bits$.prototype = $c_sjsr_Bits$.prototype;
$c_sjsr_Bits$.prototype.init___ = (function() {
  $n_sjsr_Bits$ = this;
  var x = ((($g.ArrayBuffer && $g.Int32Array) && $g.Float32Array) && $g.Float64Array);
  this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f = $uZ((!(!x)));
  this.arrayBuffer$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.ArrayBuffer(8) : null);
  this.int32Array$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.Int32Array(this.arrayBuffer$1, 0, 2) : null);
  this.float32Array$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.Float32Array(this.arrayBuffer$1, 0, 2) : null);
  this.float64Array$1 = (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f ? new $g.Float64Array(this.arrayBuffer$1, 0, 1) : null);
  if ((!this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f)) {
    var jsx$1 = true
  } else {
    this.int32Array$1[0] = 16909060;
    var jsx$1 = ($uB(new $g.Int8Array(this.arrayBuffer$1, 0, 8)[0]) === 1)
  };
  this.areTypedArraysBigEndian$1 = jsx$1;
  this.highOffset$1 = (this.areTypedArraysBigEndian$1 ? 0 : 1);
  this.lowOffset$1 = (this.areTypedArraysBigEndian$1 ? 1 : 0);
  return this
});
$c_sjsr_Bits$.prototype.numberHashCode__D__I = (function(value) {
  var iv = $uI((value | 0));
  if (((iv === value) && ((1.0 / value) !== (-Infinity)))) {
    return iv
  } else {
    var t = this.doubleToLongBits__D__J(value);
    var lo = t.lo$2;
    var hi = t.hi$2;
    return (lo ^ hi)
  }
});
$c_sjsr_Bits$.prototype.doubleToLongBitsPolyfill__p1__D__J = (function(value) {
  if ((value !== value)) {
    var _3 = $uD($g.Math.pow(2.0, 51));
    var x1_$_$$und1$1 = false;
    var x1_$_$$und2$1 = 2047;
    var x1_$_$$und3$1 = _3
  } else if (((value === Infinity) || (value === (-Infinity)))) {
    var _1 = (value < 0);
    var x1_$_$$und1$1 = _1;
    var x1_$_$$und2$1 = 2047;
    var x1_$_$$und3$1 = 0.0
  } else if ((value === 0.0)) {
    var _1$1 = ((1 / value) === (-Infinity));
    var x1_$_$$und1$1 = _1$1;
    var x1_$_$$und2$1 = 0;
    var x1_$_$$und3$1 = 0.0
  } else {
    var s = (value < 0);
    var av = (s ? (-value) : value);
    if ((av >= $uD($g.Math.pow(2.0, (-1022))))) {
      var twoPowFbits = $uD($g.Math.pow(2.0, 52));
      var a = ($uD($g.Math.log(av)) / 0.6931471805599453);
      var x = $uD($g.Math.floor(a));
      var a$1 = $uI((x | 0));
      var e = ((a$1 < 1023) ? a$1 : 1023);
      var b = e;
      var n = ((av / $uD($g.Math.pow(2.0, b))) * twoPowFbits);
      var w = $uD($g.Math.floor(n));
      var f = (n - w);
      var f$1 = ((f < 0.5) ? w : ((f > 0.5) ? (1 + w) : (((w % 2) !== 0) ? (1 + w) : w)));
      if (((f$1 / twoPowFbits) >= 2)) {
        e = ((1 + e) | 0);
        f$1 = 1.0
      };
      if ((e > 1023)) {
        e = 2047;
        f$1 = 0.0
      } else {
        e = ((1023 + e) | 0);
        f$1 = (f$1 - twoPowFbits)
      };
      var _2 = e;
      var _3$1 = f$1;
      var x1_$_$$und1$1 = s;
      var x1_$_$$und2$1 = _2;
      var x1_$_$$und3$1 = _3$1
    } else {
      var n$1 = (av / $uD($g.Math.pow(2.0, (-1074))));
      var w$1 = $uD($g.Math.floor(n$1));
      var f$2 = (n$1 - w$1);
      var _3$2 = ((f$2 < 0.5) ? w$1 : ((f$2 > 0.5) ? (1 + w$1) : (((w$1 % 2) !== 0) ? (1 + w$1) : w$1)));
      var x1_$_$$und1$1 = s;
      var x1_$_$$und2$1 = 0;
      var x1_$_$$und3$1 = _3$2
    }
  };
  var s$1 = $uZ(x1_$_$$und1$1);
  var e$1 = $uI(x1_$_$$und2$1);
  var f$3 = $uD(x1_$_$$und3$1);
  var x$1 = (f$3 / 4.294967296E9);
  var hif = $uI((x$1 | 0));
  var hi = (((s$1 ? (-2147483648) : 0) | (e$1 << 20)) | hif);
  var lo = $uI((f$3 | 0));
  return new $c_sjsr_RuntimeLong().init___I__I(lo, hi)
});
$c_sjsr_Bits$.prototype.doubleToLongBits__D__J = (function(value) {
  if (this.scala$scalajs$runtime$Bits$$$undareTypedArraysSupported$f) {
    this.float64Array$1[0] = value;
    var value$1 = $uI(this.int32Array$1[this.highOffset$1]);
    var value$2 = $uI(this.int32Array$1[this.lowOffset$1]);
    return new $c_sjsr_RuntimeLong().init___I__I(value$2, value$1)
  } else {
    return this.doubleToLongBitsPolyfill__p1__D__J(value)
  }
});
var $d_sjsr_Bits$ = new $TypeData().initClass({
  sjsr_Bits$: 0
}, false, "scala.scalajs.runtime.Bits$", {
  sjsr_Bits$: 1,
  O: 1
});
$c_sjsr_Bits$.prototype.$classData = $d_sjsr_Bits$;
var $n_sjsr_Bits$ = (void 0);
function $m_sjsr_Bits$() {
  if ((!$n_sjsr_Bits$)) {
    $n_sjsr_Bits$ = new $c_sjsr_Bits$().init___()
  };
  return $n_sjsr_Bits$
}
/** @constructor */
function $c_sjsr_RuntimeString$() {
  $c_O.call(this);
  this.CASE$undINSENSITIVE$undORDER$1 = null;
  this.bitmap$0$1 = false
}
$c_sjsr_RuntimeString$.prototype = new $h_O();
$c_sjsr_RuntimeString$.prototype.constructor = $c_sjsr_RuntimeString$;
/** @constructor */
function $h_sjsr_RuntimeString$() {
  /*<skip>*/
}
$h_sjsr_RuntimeString$.prototype = $c_sjsr_RuntimeString$.prototype;
$c_sjsr_RuntimeString$.prototype.indexOf__T__I__I__I = (function(thiz, ch, fromIndex) {
  var str = this.fromCodePoint__p1__I__T(ch);
  return $uI(thiz.indexOf(str, fromIndex))
});
$c_sjsr_RuntimeString$.prototype.init___ = (function() {
  return this
});
$c_sjsr_RuntimeString$.prototype.valueOf__O__T = (function(value) {
  return ((value === null) ? "null" : $objectToString(value))
});
$c_sjsr_RuntimeString$.prototype.replaceFirst__T__T__T__T = (function(thiz, regex, replacement) {
  if ((thiz === null)) {
    throw new $c_jl_NullPointerException().init___()
  };
  var this$1 = $m_ju_regex_Pattern$();
  var this$2 = this$1.compile__T__I__ju_regex_Pattern(regex, 0);
  return new $c_ju_regex_Matcher().init___ju_regex_Pattern__jl_CharSequence__I__I(this$2, thiz, 0, $uI(thiz.length)).replaceFirst__T__T(replacement)
});
$c_sjsr_RuntimeString$.prototype.indexOf__T__I__I = (function(thiz, ch) {
  var str = this.fromCodePoint__p1__I__T(ch);
  return $uI(thiz.indexOf(str))
});
$c_sjsr_RuntimeString$.prototype.hashCode__T__I = (function(thiz) {
  var res = 0;
  var mul = 1;
  var i = (((-1) + $uI(thiz.length)) | 0);
  while ((i >= 0)) {
    var jsx$1 = res;
    var index = i;
    res = ((jsx$1 + $imul((65535 & $uI(thiz.charCodeAt(index))), mul)) | 0);
    mul = $imul(31, mul);
    i = (((-1) + i) | 0)
  };
  return res
});
$c_sjsr_RuntimeString$.prototype.fromCodePoint__p1__I__T = (function(codePoint) {
  if ((((-65536) & codePoint) === 0)) {
    return $as_T($g.String.fromCharCode(codePoint))
  } else if (((codePoint < 0) || (codePoint > 1114111))) {
    throw new $c_jl_IllegalArgumentException().init___()
  } else {
    var offsetCp = (((-65536) + codePoint) | 0);
    return $as_T($g.String.fromCharCode((55296 | (offsetCp >> 10)), (56320 | (1023 & offsetCp))))
  }
});
$c_sjsr_RuntimeString$.prototype.replaceAll__T__T__T__T = (function(thiz, regex, replacement) {
  if ((thiz === null)) {
    throw new $c_jl_NullPointerException().init___()
  };
  var this$1 = $m_ju_regex_Pattern$();
  var this$2 = this$1.compile__T__I__ju_regex_Pattern(regex, 0);
  return new $c_ju_regex_Matcher().init___ju_regex_Pattern__jl_CharSequence__I__I(this$2, thiz, 0, $uI(thiz.length)).replaceAll__T__T(replacement)
});
var $d_sjsr_RuntimeString$ = new $TypeData().initClass({
  sjsr_RuntimeString$: 0
}, false, "scala.scalajs.runtime.RuntimeString$", {
  sjsr_RuntimeString$: 1,
  O: 1
});
$c_sjsr_RuntimeString$.prototype.$classData = $d_sjsr_RuntimeString$;
var $n_sjsr_RuntimeString$ = (void 0);
function $m_sjsr_RuntimeString$() {
  if ((!$n_sjsr_RuntimeString$)) {
    $n_sjsr_RuntimeString$ = new $c_sjsr_RuntimeString$().init___()
  };
  return $n_sjsr_RuntimeString$
}
/** @constructor */
function $c_sjsr_package$() {
  $c_O.call(this)
}
$c_sjsr_package$.prototype = new $h_O();
$c_sjsr_package$.prototype.constructor = $c_sjsr_package$;
/** @constructor */
function $h_sjsr_package$() {
  /*<skip>*/
}
$h_sjsr_package$.prototype = $c_sjsr_package$.prototype;
$c_sjsr_package$.prototype.init___ = (function() {
  return this
});
$c_sjsr_package$.prototype.unwrapJavaScriptException__jl_Throwable__O = (function(th) {
  if ($is_sjs_js_JavaScriptException(th)) {
    var x2 = $as_sjs_js_JavaScriptException(th);
    var e = x2.exception$4;
    return e
  } else {
    return th
  }
});
$c_sjsr_package$.prototype.wrapJavaScriptException__O__jl_Throwable = (function(e) {
  if ($is_jl_Throwable(e)) {
    var x2 = $as_jl_Throwable(e);
    return x2
  } else {
    return new $c_sjs_js_JavaScriptException().init___O(e)
  }
});
var $d_sjsr_package$ = new $TypeData().initClass({
  sjsr_package$: 0
}, false, "scala.scalajs.runtime.package$", {
  sjsr_package$: 1,
  O: 1
});
$c_sjsr_package$.prototype.$classData = $d_sjsr_package$;
var $n_sjsr_package$ = (void 0);
function $m_sjsr_package$() {
  if ((!$n_sjsr_package$)) {
    $n_sjsr_package$ = new $c_sjsr_package$().init___()
  };
  return $n_sjsr_package$
}
/** @constructor */
function $c_sr_BoxesRunTime$() {
  $c_O.call(this)
}
$c_sr_BoxesRunTime$.prototype = new $h_O();
$c_sr_BoxesRunTime$.prototype.constructor = $c_sr_BoxesRunTime$;
/** @constructor */
function $h_sr_BoxesRunTime$() {
  /*<skip>*/
}
$h_sr_BoxesRunTime$.prototype = $c_sr_BoxesRunTime$.prototype;
$c_sr_BoxesRunTime$.prototype.init___ = (function() {
  return this
});
$c_sr_BoxesRunTime$.prototype.equalsCharObject__jl_Character__O__Z = (function(xc, y) {
  if ($is_jl_Character(y)) {
    var x2 = $as_jl_Character(y);
    return (xc.value$1 === x2.value$1)
  } else if ($is_jl_Number(y)) {
    var x3 = $as_jl_Number(y);
    if (((typeof x3) === "number")) {
      var x2$1 = $uD(x3);
      return (x2$1 === xc.value$1)
    } else if ($is_sjsr_RuntimeLong(x3)) {
      var t = $uJ(x3);
      var lo = t.lo$2;
      var hi = t.hi$2;
      var value = xc.value$1;
      var hi$1 = (value >> 31);
      return ((lo === value) && (hi === hi$1))
    } else {
      return ((x3 === null) ? (xc === null) : $objectEquals(x3, xc))
    }
  } else {
    return ((xc === null) && (y === null))
  }
});
$c_sr_BoxesRunTime$.prototype.equalsNumObject__jl_Number__O__Z = (function(xn, y) {
  if ($is_jl_Number(y)) {
    var x2 = $as_jl_Number(y);
    return this.equalsNumNum__jl_Number__jl_Number__Z(xn, x2)
  } else if ($is_jl_Character(y)) {
    var x3 = $as_jl_Character(y);
    if (((typeof xn) === "number")) {
      var x2$1 = $uD(xn);
      return (x2$1 === x3.value$1)
    } else if ($is_sjsr_RuntimeLong(xn)) {
      var t = $uJ(xn);
      var lo = t.lo$2;
      var hi = t.hi$2;
      var value = x3.value$1;
      var hi$1 = (value >> 31);
      return ((lo === value) && (hi === hi$1))
    } else {
      return ((xn === null) ? (x3 === null) : $objectEquals(xn, x3))
    }
  } else {
    return ((xn === null) ? (y === null) : $objectEquals(xn, y))
  }
});
$c_sr_BoxesRunTime$.prototype.equals__O__O__Z = (function(x, y) {
  if ((x === y)) {
    return true
  } else if ($is_jl_Number(x)) {
    var x2 = $as_jl_Number(x);
    return this.equalsNumObject__jl_Number__O__Z(x2, y)
  } else if ($is_jl_Character(x)) {
    var x3 = $as_jl_Character(x);
    return this.equalsCharObject__jl_Character__O__Z(x3, y)
  } else {
    return ((x === null) ? (y === null) : $objectEquals(x, y))
  }
});
$c_sr_BoxesRunTime$.prototype.equalsNumNum__jl_Number__jl_Number__Z = (function(xn, yn) {
  if (((typeof xn) === "number")) {
    var x2 = $uD(xn);
    if (((typeof yn) === "number")) {
      var x2$2 = $uD(yn);
      return (x2 === x2$2)
    } else if ($is_sjsr_RuntimeLong(yn)) {
      var t = $uJ(yn);
      var lo = t.lo$2;
      var hi = t.hi$2;
      return (x2 === $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(lo, hi))
    } else if ($is_s_math_ScalaNumber(yn)) {
      var x4 = $as_s_math_ScalaNumber(yn);
      return x4.equals__O__Z(x2)
    } else {
      return false
    }
  } else if ($is_sjsr_RuntimeLong(xn)) {
    var t$1 = $uJ(xn);
    var lo$1 = t$1.lo$2;
    var hi$1 = t$1.hi$2;
    if ($is_sjsr_RuntimeLong(yn)) {
      var t$2 = $uJ(yn);
      var lo$2 = t$2.lo$2;
      var hi$2 = t$2.hi$2;
      return ((lo$1 === lo$2) && (hi$1 === hi$2))
    } else if (((typeof yn) === "number")) {
      var x3$3 = $uD(yn);
      return ($m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(lo$1, hi$1) === x3$3)
    } else if ($is_s_math_ScalaNumber(yn)) {
      var x4$2 = $as_s_math_ScalaNumber(yn);
      return x4$2.equals__O__Z(new $c_sjsr_RuntimeLong().init___I__I(lo$1, hi$1))
    } else {
      return false
    }
  } else {
    return ((xn === null) ? (yn === null) : $objectEquals(xn, yn))
  }
});
var $d_sr_BoxesRunTime$ = new $TypeData().initClass({
  sr_BoxesRunTime$: 0
}, false, "scala.runtime.BoxesRunTime$", {
  sr_BoxesRunTime$: 1,
  O: 1
});
$c_sr_BoxesRunTime$.prototype.$classData = $d_sr_BoxesRunTime$;
var $n_sr_BoxesRunTime$ = (void 0);
function $m_sr_BoxesRunTime$() {
  if ((!$n_sr_BoxesRunTime$)) {
    $n_sr_BoxesRunTime$ = new $c_sr_BoxesRunTime$().init___()
  };
  return $n_sr_BoxesRunTime$
}
var $d_sr_Null$ = new $TypeData().initClass({
  sr_Null$: 0
}, false, "scala.runtime.Null$", {
  sr_Null$: 1,
  O: 1
});
/** @constructor */
function $c_sr_ScalaRunTime$() {
  $c_O.call(this)
}
$c_sr_ScalaRunTime$.prototype = new $h_O();
$c_sr_ScalaRunTime$.prototype.constructor = $c_sr_ScalaRunTime$;
/** @constructor */
function $h_sr_ScalaRunTime$() {
  /*<skip>*/
}
$h_sr_ScalaRunTime$.prototype = $c_sr_ScalaRunTime$.prototype;
$c_sr_ScalaRunTime$.prototype.array$undlength__O__I = (function(xs) {
  if ($isArrayOf_O(xs, 1)) {
    var x2 = $asArrayOf_O(xs, 1);
    return x2.u.length
  } else if ($isArrayOf_I(xs, 1)) {
    var x3 = $asArrayOf_I(xs, 1);
    return x3.u.length
  } else if ($isArrayOf_D(xs, 1)) {
    var x4 = $asArrayOf_D(xs, 1);
    return x4.u.length
  } else if ($isArrayOf_J(xs, 1)) {
    var x5 = $asArrayOf_J(xs, 1);
    return x5.u.length
  } else if ($isArrayOf_F(xs, 1)) {
    var x6 = $asArrayOf_F(xs, 1);
    return x6.u.length
  } else if ($isArrayOf_C(xs, 1)) {
    var x7 = $asArrayOf_C(xs, 1);
    return x7.u.length
  } else if ($isArrayOf_B(xs, 1)) {
    var x8 = $asArrayOf_B(xs, 1);
    return x8.u.length
  } else if ($isArrayOf_S(xs, 1)) {
    var x9 = $asArrayOf_S(xs, 1);
    return x9.u.length
  } else if ($isArrayOf_Z(xs, 1)) {
    var x10 = $asArrayOf_Z(xs, 1);
    return x10.u.length
  } else if ($isArrayOf_sr_BoxedUnit(xs, 1)) {
    var x11 = $asArrayOf_sr_BoxedUnit(xs, 1);
    return x11.u.length
  } else if ((xs === null)) {
    throw new $c_jl_NullPointerException().init___()
  } else {
    throw new $c_s_MatchError().init___O(xs)
  }
});
$c_sr_ScalaRunTime$.prototype.init___ = (function() {
  return this
});
$c_sr_ScalaRunTime$.prototype.array$undupdate__O__I__O__V = (function(xs, idx, value) {
  if ($isArrayOf_O(xs, 1)) {
    var x2 = $asArrayOf_O(xs, 1);
    x2.set(idx, value)
  } else if ($isArrayOf_I(xs, 1)) {
    var x3 = $asArrayOf_I(xs, 1);
    x3.set(idx, $uI(value))
  } else if ($isArrayOf_D(xs, 1)) {
    var x4 = $asArrayOf_D(xs, 1);
    x4.set(idx, $uD(value))
  } else if ($isArrayOf_J(xs, 1)) {
    var x5 = $asArrayOf_J(xs, 1);
    x5.set(idx, $uJ(value))
  } else if ($isArrayOf_F(xs, 1)) {
    var x6 = $asArrayOf_F(xs, 1);
    x6.set(idx, $uF(value))
  } else if ($isArrayOf_C(xs, 1)) {
    var x7 = $asArrayOf_C(xs, 1);
    if ((value === null)) {
      var jsx$1 = 0
    } else {
      var this$2 = $as_jl_Character(value);
      var jsx$1 = this$2.value$1
    };
    x7.set(idx, jsx$1)
  } else if ($isArrayOf_B(xs, 1)) {
    var x8 = $asArrayOf_B(xs, 1);
    x8.set(idx, $uB(value))
  } else if ($isArrayOf_S(xs, 1)) {
    var x9 = $asArrayOf_S(xs, 1);
    x9.set(idx, $uS(value))
  } else if ($isArrayOf_Z(xs, 1)) {
    var x10 = $asArrayOf_Z(xs, 1);
    x10.set(idx, $uZ(value))
  } else if ($isArrayOf_sr_BoxedUnit(xs, 1)) {
    var x11 = $asArrayOf_sr_BoxedUnit(xs, 1);
    x11.set(idx, (void 0))
  } else if ((xs === null)) {
    throw new $c_jl_NullPointerException().init___()
  } else {
    throw new $c_s_MatchError().init___O(xs)
  }
});
$c_sr_ScalaRunTime$.prototype.$$undtoString__s_Product__T = (function(x) {
  var this$1 = x.productIterator__sc_Iterator();
  var start = (x.productPrefix__T() + "(");
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this$1, start, ",", ")")
});
$c_sr_ScalaRunTime$.prototype.array$undapply__O__I__O = (function(xs, idx) {
  if ($isArrayOf_O(xs, 1)) {
    var x2 = $asArrayOf_O(xs, 1);
    return x2.get(idx)
  } else if ($isArrayOf_I(xs, 1)) {
    var x3 = $asArrayOf_I(xs, 1);
    return x3.get(idx)
  } else if ($isArrayOf_D(xs, 1)) {
    var x4 = $asArrayOf_D(xs, 1);
    return x4.get(idx)
  } else if ($isArrayOf_J(xs, 1)) {
    var x5 = $asArrayOf_J(xs, 1);
    return x5.get(idx)
  } else if ($isArrayOf_F(xs, 1)) {
    var x6 = $asArrayOf_F(xs, 1);
    return x6.get(idx)
  } else if ($isArrayOf_C(xs, 1)) {
    var x7 = $asArrayOf_C(xs, 1);
    var c = x7.get(idx);
    return new $c_jl_Character().init___C(c)
  } else if ($isArrayOf_B(xs, 1)) {
    var x8 = $asArrayOf_B(xs, 1);
    return x8.get(idx)
  } else if ($isArrayOf_S(xs, 1)) {
    var x9 = $asArrayOf_S(xs, 1);
    return x9.get(idx)
  } else if ($isArrayOf_Z(xs, 1)) {
    var x10 = $asArrayOf_Z(xs, 1);
    return x10.get(idx)
  } else if ($isArrayOf_sr_BoxedUnit(xs, 1)) {
    var x11 = $asArrayOf_sr_BoxedUnit(xs, 1);
    return x11.get(idx)
  } else if ((xs === null)) {
    throw new $c_jl_NullPointerException().init___()
  } else {
    throw new $c_s_MatchError().init___O(xs)
  }
});
var $d_sr_ScalaRunTime$ = new $TypeData().initClass({
  sr_ScalaRunTime$: 0
}, false, "scala.runtime.ScalaRunTime$", {
  sr_ScalaRunTime$: 1,
  O: 1
});
$c_sr_ScalaRunTime$.prototype.$classData = $d_sr_ScalaRunTime$;
var $n_sr_ScalaRunTime$ = (void 0);
function $m_sr_ScalaRunTime$() {
  if ((!$n_sr_ScalaRunTime$)) {
    $n_sr_ScalaRunTime$ = new $c_sr_ScalaRunTime$().init___()
  };
  return $n_sr_ScalaRunTime$
}
/** @constructor */
function $c_sr_Statics$() {
  $c_O.call(this)
}
$c_sr_Statics$.prototype = new $h_O();
$c_sr_Statics$.prototype.constructor = $c_sr_Statics$;
/** @constructor */
function $h_sr_Statics$() {
  /*<skip>*/
}
$h_sr_Statics$.prototype = $c_sr_Statics$.prototype;
$c_sr_Statics$.prototype.init___ = (function() {
  return this
});
$c_sr_Statics$.prototype.doubleHash__D__I = (function(dv) {
  var iv = $doubleToInt(dv);
  if ((iv === dv)) {
    return iv
  } else {
    var this$1 = $m_sjsr_RuntimeLong$();
    var lo = this$1.scala$scalajs$runtime$RuntimeLong$$fromDoubleImpl__D__I(dv);
    var hi = this$1.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
    return (($m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(lo, hi) === dv) ? (lo ^ hi) : $m_sjsr_Bits$().numberHashCode__D__I(dv))
  }
});
$c_sr_Statics$.prototype.anyHash__O__I = (function(x) {
  if ((x === null)) {
    return 0
  } else if (((typeof x) === "number")) {
    var x3 = $uD(x);
    return this.doubleHash__D__I(x3)
  } else if ($is_sjsr_RuntimeLong(x)) {
    var t = $uJ(x);
    var lo = t.lo$2;
    var hi = t.hi$2;
    return this.longHash__J__I(new $c_sjsr_RuntimeLong().init___I__I(lo, hi))
  } else {
    return $objectHashCode(x)
  }
});
$c_sr_Statics$.prototype.longHash__J__I = (function(lv) {
  var lo = lv.lo$2;
  var lo$1 = lv.hi$2;
  return ((lo$1 === (lo >> 31)) ? lo : (lo ^ lo$1))
});
var $d_sr_Statics$ = new $TypeData().initClass({
  sr_Statics$: 0
}, false, "scala.runtime.Statics$", {
  sr_Statics$: 1,
  O: 1
});
$c_sr_Statics$.prototype.$classData = $d_sr_Statics$;
var $n_sr_Statics$ = (void 0);
function $m_sr_Statics$() {
  if ((!$n_sr_Statics$)) {
    $n_sr_Statics$ = new $c_sr_Statics$().init___()
  };
  return $n_sr_Statics$
}
/** @constructor */
function $c_Lcom_ouspark_dashboard_DashApp$() {
  $c_O.call(this)
}
$c_Lcom_ouspark_dashboard_DashApp$.prototype = new $h_O();
$c_Lcom_ouspark_dashboard_DashApp$.prototype.constructor = $c_Lcom_ouspark_dashboard_DashApp$;
/** @constructor */
function $h_Lcom_ouspark_dashboard_DashApp$() {
  /*<skip>*/
}
$h_Lcom_ouspark_dashboard_DashApp$.prototype = $c_Lcom_ouspark_dashboard_DashApp$.prototype;
$c_Lcom_ouspark_dashboard_DashApp$.prototype.init___ = (function() {
  return this
});
$c_Lcom_ouspark_dashboard_DashApp$.prototype.main__V = (function() {
  var c = $m_Lcom_ouspark_dashboard_routes_AppRouter$().router$1;
  var qual$1 = $as_Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot($as_Ljapgolly_scalajs_react_CtorType$Nullary(c.ctor__Ljapgolly_scalajs_react_CtorType()).apply__O());
  var x$1 = $m_Lorg_scalajs_dom_package$().document__Lorg_scalajs_dom_raw_HTMLDocument().body;
  var x$2 = $m_Ljapgolly_scalajs_react_Callback$().empty$1;
  $f_Ljapgolly_scalajs_react_component_Generic$UnmountedSimple__renderIntoDOM__Lorg_scalajs_dom_raw_Element__F0__O(qual$1, x$1, x$2)
});
$c_Lcom_ouspark_dashboard_DashApp$.prototype.$$js$exported$meth$main__O = (function() {
  this.main__V()
});
$c_Lcom_ouspark_dashboard_DashApp$.prototype.main = (function() {
  return this.$$js$exported$meth$main__O()
});
var $d_Lcom_ouspark_dashboard_DashApp$ = new $TypeData().initClass({
  Lcom_ouspark_dashboard_DashApp$: 0
}, false, "com.ouspark.dashboard.DashApp$", {
  Lcom_ouspark_dashboard_DashApp$: 1,
  O: 1,
  sjs_js_JSApp: 1
});
$c_Lcom_ouspark_dashboard_DashApp$.prototype.$classData = $d_Lcom_ouspark_dashboard_DashApp$;
var $n_Lcom_ouspark_dashboard_DashApp$ = (void 0);
function $m_Lcom_ouspark_dashboard_DashApp$() {
  if ((!$n_Lcom_ouspark_dashboard_DashApp$)) {
    $n_Lcom_ouspark_dashboard_DashApp$ = new $c_Lcom_ouspark_dashboard_DashApp$().init___()
  };
  return $n_Lcom_ouspark_dashboard_DashApp$
}
/** @constructor */
function $c_Lcom_ouspark_dashboard_routes_AppRouter$Dashboard$() {
  $c_O.call(this)
}
$c_Lcom_ouspark_dashboard_routes_AppRouter$Dashboard$.prototype = new $h_O();
$c_Lcom_ouspark_dashboard_routes_AppRouter$Dashboard$.prototype.constructor = $c_Lcom_ouspark_dashboard_routes_AppRouter$Dashboard$;
/** @constructor */
function $h_Lcom_ouspark_dashboard_routes_AppRouter$Dashboard$() {
  /*<skip>*/
}
$h_Lcom_ouspark_dashboard_routes_AppRouter$Dashboard$.prototype = $c_Lcom_ouspark_dashboard_routes_AppRouter$Dashboard$.prototype;
$c_Lcom_ouspark_dashboard_routes_AppRouter$Dashboard$.prototype.init___ = (function() {
  return this
});
var $d_Lcom_ouspark_dashboard_routes_AppRouter$Dashboard$ = new $TypeData().initClass({
  Lcom_ouspark_dashboard_routes_AppRouter$Dashboard$: 0
}, false, "com.ouspark.dashboard.routes.AppRouter$Dashboard$", {
  Lcom_ouspark_dashboard_routes_AppRouter$Dashboard$: 1,
  O: 1,
  Lcom_ouspark_dashboard_routes_AppRouter$AppPage: 1
});
$c_Lcom_ouspark_dashboard_routes_AppRouter$Dashboard$.prototype.$classData = $d_Lcom_ouspark_dashboard_routes_AppRouter$Dashboard$;
var $n_Lcom_ouspark_dashboard_routes_AppRouter$Dashboard$ = (void 0);
function $m_Lcom_ouspark_dashboard_routes_AppRouter$Dashboard$() {
  if ((!$n_Lcom_ouspark_dashboard_routes_AppRouter$Dashboard$)) {
    $n_Lcom_ouspark_dashboard_routes_AppRouter$Dashboard$ = new $c_Lcom_ouspark_dashboard_routes_AppRouter$Dashboard$().init___()
  };
  return $n_Lcom_ouspark_dashboard_routes_AppRouter$Dashboard$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_CtorType$Nullary() {
  $c_Ljapgolly_scalajs_react_CtorType.call(this);
  this.unmodified$2 = null;
  this.construct$2 = null;
  this.mods$2 = null
}
$c_Ljapgolly_scalajs_react_CtorType$Nullary.prototype = new $h_Ljapgolly_scalajs_react_CtorType();
$c_Ljapgolly_scalajs_react_CtorType$Nullary.prototype.constructor = $c_Ljapgolly_scalajs_react_CtorType$Nullary;
/** @constructor */
function $h_Ljapgolly_scalajs_react_CtorType$Nullary() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_CtorType$Nullary.prototype = $c_Ljapgolly_scalajs_react_CtorType$Nullary.prototype;
$c_Ljapgolly_scalajs_react_CtorType$Nullary.prototype.init___O__F1__sjs_js_UndefOr = (function(unmodified, construct, mods) {
  this.unmodified$2 = unmodified;
  this.construct$2 = construct;
  this.mods$2 = mods;
  return this
});
$c_Ljapgolly_scalajs_react_CtorType$Nullary.prototype.apply__O = (function() {
  var value = this.mods$2;
  var f = this.construct$2;
  return ((value === (void 0)) ? this.unmodified$2 : f.apply__O__O(value))
});
function $is_Ljapgolly_scalajs_react_CtorType$Nullary(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_CtorType$Nullary)))
}
function $as_Ljapgolly_scalajs_react_CtorType$Nullary(obj) {
  return (($is_Ljapgolly_scalajs_react_CtorType$Nullary(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.CtorType$Nullary"))
}
function $isArrayOf_Ljapgolly_scalajs_react_CtorType$Nullary(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_CtorType$Nullary)))
}
function $asArrayOf_Ljapgolly_scalajs_react_CtorType$Nullary(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_CtorType$Nullary(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.CtorType$Nullary;", depth))
}
var $d_Ljapgolly_scalajs_react_CtorType$Nullary = new $TypeData().initClass({
  Ljapgolly_scalajs_react_CtorType$Nullary: 0
}, false, "japgolly.scalajs.react.CtorType$Nullary", {
  Ljapgolly_scalajs_react_CtorType$Nullary: 1,
  Ljapgolly_scalajs_react_CtorType: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_CtorType$Nullary.prototype.$classData = $d_Ljapgolly_scalajs_react_CtorType$Nullary;
/** @constructor */
function $c_Ljapgolly_scalajs_react_CtorType$ProfunctorN$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_CtorType$ProfunctorN$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_CtorType$ProfunctorN$.prototype.constructor = $c_Ljapgolly_scalajs_react_CtorType$ProfunctorN$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_CtorType$ProfunctorN$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_CtorType$ProfunctorN$.prototype = $c_Ljapgolly_scalajs_react_CtorType$ProfunctorN$.prototype;
$c_Ljapgolly_scalajs_react_CtorType$ProfunctorN$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_CtorType$ProfunctorN$.prototype.rmap__Ljapgolly_scalajs_react_CtorType$Nullary__F1__Ljapgolly_scalajs_react_CtorType$Nullary = (function(x, g) {
  var jsx$1 = g.apply__O__O(x.unmodified$2);
  var g$1 = x.construct$2;
  return new $c_Ljapgolly_scalajs_react_CtorType$Nullary().init___O__F1__sjs_js_UndefOr(jsx$1, $f_F1__compose__F1__F1(g, g$1), x.mods$2)
});
$c_Ljapgolly_scalajs_react_CtorType$ProfunctorN$.prototype.dimap__Ljapgolly_scalajs_react_CtorType$Nullary__F1__F1__Ljapgolly_scalajs_react_CtorType$Nullary = (function(x, f, g) {
  var jsx$1 = g.apply__O__O(x.unmodified$2);
  var g$1 = x.construct$2;
  return new $c_Ljapgolly_scalajs_react_CtorType$Nullary().init___O__F1__sjs_js_UndefOr(jsx$1, $f_F1__compose__F1__F1(g, g$1), x.mods$2)
});
var $d_Ljapgolly_scalajs_react_CtorType$ProfunctorN$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_CtorType$ProfunctorN$: 0
}, false, "japgolly.scalajs.react.CtorType$ProfunctorN$", {
  Ljapgolly_scalajs_react_CtorType$ProfunctorN$: 1,
  O: 1,
  Ljapgolly_scalajs_react_internal_Profunctor: 1
});
$c_Ljapgolly_scalajs_react_CtorType$ProfunctorN$.prototype.$classData = $d_Ljapgolly_scalajs_react_CtorType$ProfunctorN$;
var $n_Ljapgolly_scalajs_react_CtorType$ProfunctorN$ = (void 0);
function $m_Ljapgolly_scalajs_react_CtorType$ProfunctorN$() {
  if ((!$n_Ljapgolly_scalajs_react_CtorType$ProfunctorN$)) {
    $n_Ljapgolly_scalajs_react_CtorType$ProfunctorN$ = new $c_Ljapgolly_scalajs_react_CtorType$ProfunctorN$().init___()
  };
  return $n_Ljapgolly_scalajs_react_CtorType$ProfunctorN$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1() {
  $c_O.call(this);
  this.summon$1 = null;
  this.pf$1 = null
}
$c_Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1.prototype.constructor = $c_Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1;
/** @constructor */
function $h_Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1.prototype = $c_Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1.prototype;
$c_Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1.prototype.init___F1__Ljapgolly_scalajs_react_internal_Profunctor = (function(f$6, p$3) {
  this.summon$1 = f$6;
  this.pf$1 = p$3;
  return this
});
var $d_Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1: 0
}, false, "japgolly.scalajs.react.CtorType$Summoner$$anon$1", {
  Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1: 1,
  O: 1,
  Ljapgolly_scalajs_react_CtorType$Summoner: 1
});
$c_Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1.prototype.$classData = $d_Ljapgolly_scalajs_react_CtorType$Summoner$$anon$1;
function $is_Ljapgolly_scalajs_react_component_Generic$UnmountedWithRoot(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_component_Generic$UnmountedWithRoot)))
}
function $as_Ljapgolly_scalajs_react_component_Generic$UnmountedWithRoot(obj) {
  return (($is_Ljapgolly_scalajs_react_component_Generic$UnmountedWithRoot(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.component.Generic$UnmountedWithRoot"))
}
function $isArrayOf_Ljapgolly_scalajs_react_component_Generic$UnmountedWithRoot(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_component_Generic$UnmountedWithRoot)))
}
function $asArrayOf_Ljapgolly_scalajs_react_component_Generic$UnmountedWithRoot(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_component_Generic$UnmountedWithRoot(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.component.Generic$UnmountedWithRoot;", depth))
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_Js$() {
  $c_O.call(this);
  this.rawComponentDisplayName$1 = null
}
$c_Ljapgolly_scalajs_react_component_Js$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_Js$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_Js$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_Js$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_Js$.prototype = $c_Ljapgolly_scalajs_react_component_Js$.prototype;
$c_Ljapgolly_scalajs_react_component_Js$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_component_Js$ = this;
  this.rawComponentDisplayName$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(c$2) {
      return $this.japgolly$scalajs$react$component$Js$$fixDisplayName__sjs_js_UndefOr__T(c$2.displayName)
    })
  })(this));
  return this
});
$c_Ljapgolly_scalajs_react_component_Js$.prototype.japgolly$scalajs$react$component$Js$$fixDisplayName__sjs_js_UndefOr__T = (function(n) {
  return $as_T(((n === (void 0)) ? "" : n))
});
$c_Ljapgolly_scalajs_react_component_Js$.prototype.unmounted__Ljapgolly_scalajs_react_raw_package$ReactComponentElement__Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot = (function(r) {
  var m = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(r$2$2) {
      return new $c_Ljapgolly_scalajs_react_component_Js$$anon$1().init___Ljapgolly_scalajs_react_raw_package$ReactComponent(r$2$2)
    })
  })(this));
  return new $c_Ljapgolly_scalajs_react_component_Js$$anon$3().init___Ljapgolly_scalajs_react_raw_package$ReactComponentElement__F1(r, m)
});
$c_Ljapgolly_scalajs_react_component_Js$.prototype.component__sjs_js_Function1__Ljapgolly_scalajs_react_CtorType$Summoner__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot = (function(rc, s) {
  var this$4 = s.pf$1;
  var f = s.summon$1.apply__O__O(rc);
  var m = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(r$2) {
      return $this.unmounted__Ljapgolly_scalajs_react_raw_package$ReactComponentElement__Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot(r$2)
    })
  })(this));
  var c = this$4.rmap__Ljapgolly_scalajs_react_CtorType$Nullary__F1__Ljapgolly_scalajs_react_CtorType$Nullary($as_Ljapgolly_scalajs_react_CtorType$Nullary(f), m);
  var pf = s.pf$1;
  return new $c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1().init___Ljapgolly_scalajs_react_component_JsBaseComponentTemplate__sjs_js_Any__Ljapgolly_scalajs_react_CtorType__Ljapgolly_scalajs_react_internal_Profunctor(this, rc, c, pf)
});
var $d_Ljapgolly_scalajs_react_component_Js$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_Js$: 0
}, false, "japgolly.scalajs.react.component.Js$", {
  Ljapgolly_scalajs_react_component_Js$: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_JsBaseComponentTemplate: 1
});
$c_Ljapgolly_scalajs_react_component_Js$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_Js$;
var $n_Ljapgolly_scalajs_react_component_Js$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_Js$() {
  if ((!$n_Ljapgolly_scalajs_react_component_Js$)) {
    $n_Ljapgolly_scalajs_react_component_Js$ = new $c_Ljapgolly_scalajs_react_component_Js$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_Js$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_JsFn$() {
  $c_O.call(this);
  this.japgolly$scalajs$react$component$JsFn$$constUnit$1 = null
}
$c_Ljapgolly_scalajs_react_component_JsFn$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_JsFn$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_JsFn$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_JsFn$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_JsFn$.prototype = $c_Ljapgolly_scalajs_react_component_JsFn$.prototype;
$c_Ljapgolly_scalajs_react_component_JsFn$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_component_JsFn$ = this;
  this.japgolly$scalajs$react$component$JsFn$$constUnit$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$2$2) {
      return (void 0)
    })
  })(this));
  return this
});
var $d_Ljapgolly_scalajs_react_component_JsFn$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_JsFn$: 0
}, false, "japgolly.scalajs.react.component.JsFn$", {
  Ljapgolly_scalajs_react_component_JsFn$: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_JsBaseComponentTemplate: 1
});
$c_Ljapgolly_scalajs_react_component_JsFn$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_JsFn$;
var $n_Ljapgolly_scalajs_react_component_JsFn$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_JsFn$() {
  if ((!$n_Ljapgolly_scalajs_react_component_JsFn$)) {
    $n_Ljapgolly_scalajs_react_component_JsFn$ = new $c_Ljapgolly_scalajs_react_component_JsFn$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_JsFn$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount() {
  $c_O.call(this);
  this.raw$1 = null
}
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount.prototype.constructor = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount.prototype = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount.prototype;
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount.prototype.raw__Ljapgolly_scalajs_react_raw_package$ReactComponent = (function() {
  return this.raw$1
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount.prototype.init___Ljapgolly_scalajs_react_raw_package$ReactComponent = (function(raw) {
  this.raw$1 = raw;
  return this
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount.prototype.equals__O__Z = (function(x$1) {
  return $m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount$().equals$extension__Ljapgolly_scalajs_react_raw_package$ReactComponent__O__Z(this.raw$1, x$1)
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount.prototype.toString__T = (function() {
  return $m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount$().toString$extension__Ljapgolly_scalajs_react_raw_package$ReactComponent__T(this.raw$1)
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount.prototype.hashCode__I = (function() {
  var $$this = this.raw$1;
  return $objectHashCode($$this)
});
function $is_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount)))
}
function $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount(obj) {
  return (($is_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.component.ScalaBuilder$Lifecycle$ComponentWillUnmount"))
}
function $isArrayOf_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount)))
}
function $asArrayOf_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.component.ScalaBuilder$Lifecycle$ComponentWillUnmount;", depth))
}
var $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount: 0
}, false, "japgolly.scalajs.react.component.ScalaBuilder$Lifecycle$ComponentWillUnmount", {
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base: 1
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount.prototype.$classData = $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUnmount;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUpdate() {
  $c_O.call(this);
  this.raw$1 = null;
  this.nextProps$1 = null;
  this.nextState$1 = null
}
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUpdate.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUpdate.prototype.constructor = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUpdate;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUpdate() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUpdate.prototype = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUpdate.prototype;
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUpdate.prototype.raw__Ljapgolly_scalajs_react_raw_package$ReactComponent = (function() {
  return this.raw$1
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUpdate.prototype.toString__T = (function() {
  return $m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$().japgolly$scalajs$react$component$ScalaBuilder$Lifecycle$$wrapTostring__T__T(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["ComponentWillUpdate(props: ", " \u2192 ", ", state: ", " \u2192 ", ")"])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([$f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this).props__O(), this.nextProps$1, $f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this).state__O(), this.nextState$1])))
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUpdate.prototype.init___Ljapgolly_scalajs_react_raw_package$ReactComponent__O__O = (function(raw, nextProps, nextState) {
  this.raw$1 = raw;
  this.nextProps$1 = nextProps;
  this.nextState$1 = nextState;
  return this
});
var $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUpdate = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUpdate: 0
}, false, "japgolly.scalajs.react.component.ScalaBuilder$Lifecycle$ComponentWillUpdate", {
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUpdate: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base: 1
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUpdate.prototype.$classData = $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillUpdate;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ShouldComponentUpdate() {
  $c_O.call(this);
  this.raw$1 = null;
  this.nextProps$1 = null;
  this.nextState$1 = null
}
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ShouldComponentUpdate.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ShouldComponentUpdate.prototype.constructor = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ShouldComponentUpdate;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ShouldComponentUpdate() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ShouldComponentUpdate.prototype = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ShouldComponentUpdate.prototype;
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ShouldComponentUpdate.prototype.raw__Ljapgolly_scalajs_react_raw_package$ReactComponent = (function() {
  return this.raw$1
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ShouldComponentUpdate.prototype.toString__T = (function() {
  return $m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$().japgolly$scalajs$react$component$ScalaBuilder$Lifecycle$$wrapTostring__T__T(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["ShouldComponentUpdate(props: ", " \u2192 ", ", state: ", " \u2192 ", ")"])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([$f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this).props__O(), this.nextProps$1, $f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this).state__O(), this.nextState$1])))
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ShouldComponentUpdate.prototype.init___Ljapgolly_scalajs_react_raw_package$ReactComponent__O__O = (function(raw, nextProps, nextState) {
  this.raw$1 = raw;
  this.nextProps$1 = nextProps;
  this.nextState$1 = nextState;
  return this
});
function $is_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ShouldComponentUpdate(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ShouldComponentUpdate)))
}
function $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ShouldComponentUpdate(obj) {
  return (($is_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ShouldComponentUpdate(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.component.ScalaBuilder$Lifecycle$ShouldComponentUpdate"))
}
function $isArrayOf_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ShouldComponentUpdate(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ShouldComponentUpdate)))
}
function $asArrayOf_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ShouldComponentUpdate(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ShouldComponentUpdate(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.component.ScalaBuilder$Lifecycle$ShouldComponentUpdate;", depth))
}
var $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ShouldComponentUpdate = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ShouldComponentUpdate: 0
}, false, "japgolly.scalajs.react.component.ScalaBuilder$Lifecycle$ShouldComponentUpdate", {
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ShouldComponentUpdate: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base: 1
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ShouldComponentUpdate.prototype.$classData = $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ShouldComponentUpdate;
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_OnUnmount$Backend() {
  $c_O.call(this);
  this.japgolly$scalajs$react$extra$OnUnmount$$unmountProcs$1 = null
}
$c_Ljapgolly_scalajs_react_extra_OnUnmount$Backend.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_OnUnmount$Backend.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_OnUnmount$Backend;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_OnUnmount$Backend() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_OnUnmount$Backend.prototype = $c_Ljapgolly_scalajs_react_extra_OnUnmount$Backend.prototype;
$c_Ljapgolly_scalajs_react_extra_OnUnmount$Backend.prototype.init___ = (function() {
  this.japgolly$scalajs$react$extra$OnUnmount$$unmountProcs$1 = $m_sci_Nil$();
  return this
});
var $d_Ljapgolly_scalajs_react_extra_OnUnmount$Backend = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_OnUnmount$Backend: 0
}, false, "japgolly.scalajs.react.extra.OnUnmount$Backend", {
  Ljapgolly_scalajs_react_extra_OnUnmount$Backend: 1,
  O: 1,
  Ljapgolly_scalajs_react_extra_OnUnmount: 1
});
$c_Ljapgolly_scalajs_react_extra_OnUnmount$Backend.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_OnUnmount$Backend;
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_RouterLogic$$anon$1() {
  $c_Ljapgolly_scalajs_react_extra_router_RouterCtl.call(this);
  this.refresh$2 = null;
  this.$$outer$2 = null
}
$c_Ljapgolly_scalajs_react_extra_router_RouterLogic$$anon$1.prototype = new $h_Ljapgolly_scalajs_react_extra_router_RouterCtl();
$c_Ljapgolly_scalajs_react_extra_router_RouterLogic$$anon$1.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_RouterLogic$$anon$1;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_RouterLogic$$anon$1() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_RouterLogic$$anon$1.prototype = $c_Ljapgolly_scalajs_react_extra_router_RouterLogic$$anon$1.prototype;
$c_Ljapgolly_scalajs_react_extra_router_RouterLogic$$anon$1.prototype.init___Ljapgolly_scalajs_react_extra_router_RouterLogic = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  this.refresh$2 = $$outer.interpret__Ljapgolly_scalajs_react_extra_router_RouteCmd__F0($m_Ljapgolly_scalajs_react_extra_router_RouteCmd$BroadcastSync$());
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_RouterLogic$$anon$1.prototype.refresh__F0 = (function() {
  return this.refresh$2
});
var $d_Ljapgolly_scalajs_react_extra_router_RouterLogic$$anon$1 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_RouterLogic$$anon$1: 0
}, false, "japgolly.scalajs.react.extra.router.RouterLogic$$anon$1", {
  Ljapgolly_scalajs_react_extra_router_RouterLogic$$anon$1: 1,
  Ljapgolly_scalajs_react_extra_router_RouterCtl: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_extra_router_RouterLogic$$anon$1.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_RouterLogic$$anon$1;
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Route() {
  $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteCommon.call(this);
  this.pattern$2 = null;
  this.parseFn$2 = null;
  this.buildFn$2 = null
}
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Route.prototype = new $h_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteCommon();
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Route.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Route;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_StaticDsl$Route() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_StaticDsl$Route.prototype = $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Route.prototype;
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Route.prototype.toString__T = (function() {
  return new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["Route(", ")"])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.pattern$2]))
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Route.prototype.init___ju_regex_Pattern__F1__F1 = (function(pattern, parseFn, buildFn) {
  this.pattern$2 = pattern;
  this.parseFn$2 = parseFn;
  this.buildFn$2 = buildFn;
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Route.prototype.pmap__F1__F1__Ljapgolly_scalajs_react_extra_router_StaticDsl$Route = (function(b, a) {
  var jsx$2 = this.pattern$2;
  var jsx$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, b$1) {
    return (function(x$29$2) {
      var x$29 = $as_ju_regex_Matcher(x$29$2);
      var this$1 = $as_s_Option($this.parseFn$2.apply__O__O(x$29));
      return (this$1.isEmpty__Z() ? $m_s_None$() : $as_s_Option(b$1.apply__O__O(this$1.get__O())))
    })
  })(this, b));
  var this$2 = this.buildFn$2;
  return new $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Route().init___ju_regex_Pattern__F1__F1(jsx$2, jsx$1, $f_F1__compose__F1__F1(this$2, a))
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Route.prototype.pmap__F1__F1__Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteCommon = (function(b, a) {
  return this.pmap__F1__F1__Ljapgolly_scalajs_react_extra_router_StaticDsl$Route(b, a)
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Route.prototype.pathFor__O__Ljapgolly_scalajs_react_extra_router_Path = (function(a) {
  return $as_Ljapgolly_scalajs_react_extra_router_Path(this.buildFn$2.apply__O__O(a))
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Route.prototype.parse__Ljapgolly_scalajs_react_extra_router_Path__s_Option = (function(path) {
  var this$1 = this.pattern$2;
  var input = path.value$2;
  var m = new $c_ju_regex_Matcher().init___ju_regex_Pattern__jl_CharSequence__I__I(this$1, input, 0, $uI(input.length));
  return (m.matches__Z() ? $as_s_Option(this.parseFn$2.apply__O__O(m)) : $m_s_None$())
});
function $is_Ljapgolly_scalajs_react_extra_router_StaticDsl$Route(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_extra_router_StaticDsl$Route)))
}
function $as_Ljapgolly_scalajs_react_extra_router_StaticDsl$Route(obj) {
  return (($is_Ljapgolly_scalajs_react_extra_router_StaticDsl$Route(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.extra.router.StaticDsl$Route"))
}
function $isArrayOf_Ljapgolly_scalajs_react_extra_router_StaticDsl$Route(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_extra_router_StaticDsl$Route)))
}
function $asArrayOf_Ljapgolly_scalajs_react_extra_router_StaticDsl$Route(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_extra_router_StaticDsl$Route(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.extra.router.StaticDsl$Route;", depth))
}
var $d_Ljapgolly_scalajs_react_extra_router_StaticDsl$Route = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_StaticDsl$Route: 0
}, false, "japgolly.scalajs.react.extra.router.StaticDsl$Route", {
  Ljapgolly_scalajs_react_extra_router_StaticDsl$Route: 1,
  Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteCommon: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Route.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_StaticDsl$Route;
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB() {
  $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteCommon.call(this);
  this.regex$2 = null;
  this.matchGroups$2 = 0;
  this.parse$2 = null;
  this.build$2 = null
}
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB.prototype = new $h_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteCommon();
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB.prototype = $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB.prototype;
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB.prototype.toString__T = (function() {
  return new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["RouteB(", ")"])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.regex$2]))
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB.prototype.pmap__F1__F1__Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB = (function(b, a) {
  var jsx$3 = this.regex$2;
  var jsx$2 = this.matchGroups$2;
  var jsx$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, b$1) {
    return (function(x$24$2) {
      var x$24 = $as_F1(x$24$2);
      var this$1 = $as_s_Option($this.parse$2.apply__O__O(x$24));
      return (this$1.isEmpty__Z() ? $m_s_None$() : $as_s_Option(b$1.apply__O__O(this$1.get__O())))
    })
  })(this, b));
  var this$2 = this.build$2;
  return new $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB().init___T__I__F1__F1(jsx$3, jsx$2, jsx$1, $f_F1__compose__F1__F1(this$2, a))
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB.prototype.pmap__F1__F1__Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteCommon = (function(b, a) {
  return this.pmap__F1__F1__Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB(b, a)
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB.prototype.route__Ljapgolly_scalajs_react_extra_router_StaticDsl$Route = (function() {
  var this$1 = $m_ju_regex_Pattern$();
  var regex = (("^" + this.regex$2) + "$");
  var p = this$1.compile__T__I__ju_regex_Pattern(regex, 0);
  return new $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Route().init___ju_regex_Pattern__F1__F1(p, new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(m$2) {
      var m = $as_ju_regex_Matcher(m$2);
      return $as_s_Option($this.parse$2.apply__O__O(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1, m$1) {
        return (function(i$2) {
          var i = $uI(i$2);
          return m$1.group__I__T(((1 + i) | 0))
        })
      })($this, m))))
    })
  })(this)), new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2) {
    return (function(a$2) {
      return new $c_Ljapgolly_scalajs_react_extra_router_Path().init___T($as_T(this$2.build$2.apply__O__O(a$2)))
    })
  })(this)))
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB.prototype.init___T__I__F1__F1 = (function(regex, matchGroups, parse, build) {
  this.regex$2 = regex;
  this.matchGroups$2 = matchGroups;
  this.parse$2 = parse;
  this.build$2 = build;
  return this
});
var $d_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB: 0
}, false, "japgolly.scalajs.react.extra.router.StaticDsl$RouteB", {
  Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB: 1,
  Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteCommon: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_StaticDsl$RouteB;
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_Effect$$anon$1() {
  $c_Ljapgolly_scalajs_react_internal_Effect.call(this)
}
$c_Ljapgolly_scalajs_react_internal_Effect$$anon$1.prototype = new $h_Ljapgolly_scalajs_react_internal_Effect();
$c_Ljapgolly_scalajs_react_internal_Effect$$anon$1.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_Effect$$anon$1;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_Effect$$anon$1() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_Effect$$anon$1.prototype = $c_Ljapgolly_scalajs_react_internal_Effect$$anon$1.prototype;
$c_Ljapgolly_scalajs_react_internal_Effect$$anon$1.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_internal_Effect$$anon$1.prototype.extract__F0__F0 = (function(a) {
  return a
});
$c_Ljapgolly_scalajs_react_internal_Effect$$anon$1.prototype.point__F0__O = (function(a) {
  return a.apply__O()
});
var $d_Ljapgolly_scalajs_react_internal_Effect$$anon$1 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_Effect$$anon$1: 0
}, false, "japgolly.scalajs.react.internal.Effect$$anon$1", {
  Ljapgolly_scalajs_react_internal_Effect$$anon$1: 1,
  Ljapgolly_scalajs_react_internal_Effect: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_Effect$$anon$1.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_Effect$$anon$1;
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_Effect$$anon$2() {
  $c_Ljapgolly_scalajs_react_internal_Effect.call(this)
}
$c_Ljapgolly_scalajs_react_internal_Effect$$anon$2.prototype = new $h_Ljapgolly_scalajs_react_internal_Effect();
$c_Ljapgolly_scalajs_react_internal_Effect$$anon$2.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_Effect$$anon$2;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_Effect$$anon$2() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_Effect$$anon$2.prototype = $c_Ljapgolly_scalajs_react_internal_Effect$$anon$2.prototype;
$c_Ljapgolly_scalajs_react_internal_Effect$$anon$2.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_internal_Effect$$anon$2.prototype.extract__F0__F0 = (function(a) {
  var $$this = $as_Ljapgolly_scalajs_react_CallbackTo(a.apply__O()).japgolly$scalajs$react$CallbackTo$$f$1;
  return $$this
});
$c_Ljapgolly_scalajs_react_internal_Effect$$anon$2.prototype.point__F0__O = (function(a) {
  return new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0(a)
});
var $d_Ljapgolly_scalajs_react_internal_Effect$$anon$2 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_Effect$$anon$2: 0
}, false, "japgolly.scalajs.react.internal.Effect$$anon$2", {
  Ljapgolly_scalajs_react_internal_Effect$$anon$2: 1,
  Ljapgolly_scalajs_react_internal_Effect: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_Effect$$anon$2.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_Effect$$anon$2;
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_Effect$Trans$Id() {
  $c_Ljapgolly_scalajs_react_internal_Effect$Trans.call(this)
}
$c_Ljapgolly_scalajs_react_internal_Effect$Trans$Id.prototype = new $h_Ljapgolly_scalajs_react_internal_Effect$Trans();
$c_Ljapgolly_scalajs_react_internal_Effect$Trans$Id.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_Effect$Trans$Id;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_Effect$Trans$Id() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_Effect$Trans$Id.prototype = $c_Ljapgolly_scalajs_react_internal_Effect$Trans$Id.prototype;
$c_Ljapgolly_scalajs_react_internal_Effect$Trans$Id.prototype.apply__F0__O = (function(f) {
  return f.apply__O()
});
$c_Ljapgolly_scalajs_react_internal_Effect$Trans$Id.prototype.init___Ljapgolly_scalajs_react_internal_Effect = (function(F) {
  $c_Ljapgolly_scalajs_react_internal_Effect$Trans.prototype.init___Ljapgolly_scalajs_react_internal_Effect__Ljapgolly_scalajs_react_internal_Effect.call(this, F, F);
  return this
});
var $d_Ljapgolly_scalajs_react_internal_Effect$Trans$Id = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_Effect$Trans$Id: 0
}, false, "japgolly.scalajs.react.internal.Effect$Trans$Id", {
  Ljapgolly_scalajs_react_internal_Effect$Trans$Id: 1,
  Ljapgolly_scalajs_react_internal_Effect$Trans: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_internal_Effect$Trans$Id.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_Effect$Trans$Id;
/** @constructor */
function $c_Ljapgolly_scalajs_react_package$() {
  $c_O.call(this);
  this.GenericComponent$1 = null;
  this.JsComponent$1 = null;
  this.JsFnComponent$1 = null;
  this.ScalaComponent$1 = null;
  this.ScalaFnComponent$1 = null
}
$c_Ljapgolly_scalajs_react_package$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_package$.prototype.constructor = $c_Ljapgolly_scalajs_react_package$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_package$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_package$.prototype = $c_Ljapgolly_scalajs_react_package$.prototype;
$c_Ljapgolly_scalajs_react_package$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_package$ = this;
  this.GenericComponent$1 = $m_Ljapgolly_scalajs_react_component_Generic$();
  this.JsComponent$1 = $m_Ljapgolly_scalajs_react_component_Js$();
  this.JsFnComponent$1 = $m_Ljapgolly_scalajs_react_component_JsFn$();
  this.ScalaComponent$1 = $m_Ljapgolly_scalajs_react_component_Scala$();
  this.ScalaFnComponent$1 = $m_Ljapgolly_scalajs_react_component_ScalaFn$();
  return this
});
var $d_Ljapgolly_scalajs_react_package$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_package$: 0
}, false, "japgolly.scalajs.react.package$", {
  Ljapgolly_scalajs_react_package$: 1,
  O: 1,
  Ljapgolly_scalajs_react_ReactEventTypes: 1
});
$c_Ljapgolly_scalajs_react_package$.prototype.$classData = $d_Ljapgolly_scalajs_react_package$;
var $n_Ljapgolly_scalajs_react_package$ = (void 0);
function $m_Ljapgolly_scalajs_react_package$() {
  if ((!$n_Ljapgolly_scalajs_react_package$)) {
    $n_Ljapgolly_scalajs_react_package$ = new $c_Ljapgolly_scalajs_react_package$().init___()
  };
  return $n_Ljapgolly_scalajs_react_package$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_Attr$ClassName$() {
  $c_Ljapgolly_scalajs_react_vdom_Attr.call(this)
}
$c_Ljapgolly_scalajs_react_vdom_Attr$ClassName$.prototype = new $h_Ljapgolly_scalajs_react_vdom_Attr();
$c_Ljapgolly_scalajs_react_vdom_Attr$ClassName$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Attr$ClassName$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_Attr$ClassName$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_Attr$ClassName$.prototype = $c_Ljapgolly_scalajs_react_vdom_Attr$ClassName$.prototype;
$c_Ljapgolly_scalajs_react_vdom_Attr$ClassName$.prototype.init___ = (function() {
  $c_Ljapgolly_scalajs_react_vdom_Attr.prototype.init___T.call(this, "class");
  return this
});
$c_Ljapgolly_scalajs_react_vdom_Attr$ClassName$.prototype.$$colon$eq__O__F2__Ljapgolly_scalajs_react_vdom_TagMod = (function(a, t) {
  $m_Ljapgolly_scalajs_react_vdom_TagMod$();
  var f = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, a$1, t$1) {
    return (function(b$2) {
      var b = $as_Ljapgolly_scalajs_react_vdom_Builder(b$2);
      t$1.apply__O__O__O(b.addClassName$1, a$1)
    })
  })(this, a, t));
  return new $c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$1().init___F1(f)
});
var $d_Ljapgolly_scalajs_react_vdom_Attr$ClassName$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Attr$ClassName$: 0
}, false, "japgolly.scalajs.react.vdom.Attr$ClassName$", {
  Ljapgolly_scalajs_react_vdom_Attr$ClassName$: 1,
  Ljapgolly_scalajs_react_vdom_Attr: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_Attr$ClassName$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Attr$ClassName$;
var $n_Ljapgolly_scalajs_react_vdom_Attr$ClassName$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_Attr$ClassName$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_Attr$ClassName$)) {
    $n_Ljapgolly_scalajs_react_vdom_Attr$ClassName$ = new $c_Ljapgolly_scalajs_react_vdom_Attr$ClassName$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_Attr$ClassName$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_Attr$Generic() {
  $c_Ljapgolly_scalajs_react_vdom_Attr.call(this)
}
$c_Ljapgolly_scalajs_react_vdom_Attr$Generic.prototype = new $h_Ljapgolly_scalajs_react_vdom_Attr();
$c_Ljapgolly_scalajs_react_vdom_Attr$Generic.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Attr$Generic;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_Attr$Generic() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_Attr$Generic.prototype = $c_Ljapgolly_scalajs_react_vdom_Attr$Generic.prototype;
$c_Ljapgolly_scalajs_react_vdom_Attr$Generic.prototype.$$colon$eq__O__F2__Ljapgolly_scalajs_react_vdom_TagMod = (function(a, t) {
  return $m_Ljapgolly_scalajs_react_vdom_Attr$ValueType$().apply$extension__F2__T__O__Ljapgolly_scalajs_react_vdom_TagMod(t, this.name$1, a)
});
$c_Ljapgolly_scalajs_react_vdom_Attr$Generic.prototype.init___T = (function(name) {
  $c_Ljapgolly_scalajs_react_vdom_Attr.prototype.init___T.call(this, name);
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_Attr$Generic = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Attr$Generic: 0
}, false, "japgolly.scalajs.react.vdom.Attr$Generic", {
  Ljapgolly_scalajs_react_vdom_Attr$Generic: 1,
  Ljapgolly_scalajs_react_vdom_Attr: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_Attr$Generic.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Attr$Generic;
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_HtmlTags$() {
  $c_O.call(this);
  this.input$module$1 = null
}
$c_Ljapgolly_scalajs_react_vdom_HtmlTags$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_HtmlTags$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_HtmlTags$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_HtmlTags$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_HtmlTags$.prototype = $c_Ljapgolly_scalajs_react_vdom_HtmlTags$.prototype;
$c_Ljapgolly_scalajs_react_vdom_HtmlTags$.prototype.init___ = (function() {
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_HtmlTags$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_HtmlTags$: 0
}, false, "japgolly.scalajs.react.vdom.HtmlTags$", {
  Ljapgolly_scalajs_react_vdom_HtmlTags$: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_HtmlTags: 1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlTags$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_HtmlTags$;
var $n_Ljapgolly_scalajs_react_vdom_HtmlTags$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_HtmlTags$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_HtmlTags$)) {
    $n_Ljapgolly_scalajs_react_vdom_HtmlTags$ = new $c_Ljapgolly_scalajs_react_vdom_HtmlTags$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_HtmlTags$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$1() {
  $c_O.call(this);
  this.f$1$1 = null
}
$c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$1.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$1.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$1;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_TagMod$$anon$1() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_TagMod$$anon$1.prototype = $c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$1.prototype;
$c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$1.prototype.init___F1 = (function(f$1) {
  this.f$1$1 = f$1;
  return this
});
$c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$1.prototype.applyTo__Ljapgolly_scalajs_react_vdom_Builder__V = (function(b) {
  this.f$1$1.apply__O__O(b)
});
var $d_Ljapgolly_scalajs_react_vdom_TagMod$$anon$1 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_TagMod$$anon$1: 0
}, false, "japgolly.scalajs.react.vdom.TagMod$$anon$1", {
  Ljapgolly_scalajs_react_vdom_TagMod$$anon$1: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_TagMod: 1
});
$c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$1.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_TagMod$$anon$1;
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$2() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$2.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$2.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$2;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_TagMod$$anon$2() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_TagMod$$anon$2.prototype = $c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$2.prototype;
$c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$2.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$2.prototype.toString__T = (function() {
  return "EmptyVdom"
});
$c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$2.prototype.applyTo__Ljapgolly_scalajs_react_vdom_Builder__V = (function(b) {
  /*<skip>*/
});
var $d_Ljapgolly_scalajs_react_vdom_TagMod$$anon$2 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_TagMod$$anon$2: 0
}, false, "japgolly.scalajs.react.vdom.TagMod$$anon$2", {
  Ljapgolly_scalajs_react_vdom_TagMod$$anon$2: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_TagMod: 1
});
$c_Ljapgolly_scalajs_react_vdom_TagMod$$anon$2.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_TagMod$$anon$2;
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_TagOf() {
  $c_O.call(this);
  this.render$1 = null;
  this.tag$1 = null;
  this.modifiers$1 = null;
  this.namespace$1 = null;
  this.bitmap$0$1 = false
}
$c_Ljapgolly_scalajs_react_vdom_TagOf.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_TagOf.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_TagOf;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_TagOf() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_TagOf.prototype = $c_Ljapgolly_scalajs_react_vdom_TagOf.prototype;
$c_Ljapgolly_scalajs_react_vdom_TagOf.prototype.toString__T = (function() {
  return this.render__Ljapgolly_scalajs_react_vdom_VdomElement().toString__T()
});
$c_Ljapgolly_scalajs_react_vdom_TagOf.prototype.init___T__sci_List__T = (function(tag, modifiers, namespace) {
  this.tag$1 = tag;
  this.modifiers$1 = modifiers;
  this.namespace$1 = namespace;
  return this
});
$c_Ljapgolly_scalajs_react_vdom_TagOf.prototype.apply__sc_Seq__Ljapgolly_scalajs_react_vdom_TagOf = (function(xs) {
  var this$1 = this.modifiers$1;
  var x$4 = new $c_sci_$colon$colon().init___O__sci_List(xs, this$1);
  var x$5 = this.tag$1;
  var x$6 = this.namespace$1;
  return new $c_Ljapgolly_scalajs_react_vdom_TagOf().init___T__sci_List__T(x$5, x$4, x$6)
});
$c_Ljapgolly_scalajs_react_vdom_TagOf.prototype.render$lzycompute__p1__Ljapgolly_scalajs_react_vdom_VdomElement = (function() {
  if ((!this.bitmap$0$1)) {
    var b = new $c_Ljapgolly_scalajs_react_vdom_Builder().init___();
    this.build__p1__Ljapgolly_scalajs_react_vdom_Builder__V(b);
    this.render$1 = b.render__T__Ljapgolly_scalajs_react_vdom_VdomElement(this.tag$1);
    this.bitmap$0$1 = true
  };
  return this.render$1
});
$c_Ljapgolly_scalajs_react_vdom_TagOf.prototype.build__p1__Ljapgolly_scalajs_react_vdom_Builder__V = (function(b) {
  var current = this.modifiers$1;
  var this$1 = this.modifiers$1;
  var arr = $newArrayObject($d_sc_Seq.getArrayOf(), [$f_sc_LinearSeqOptimized__length__I(this$1)]);
  var i = 0;
  while (true) {
    var x = current;
    var x$2 = $m_sci_Nil$();
    if ((!((x !== null) && x.equals__O__Z(x$2)))) {
      arr.set(i, $as_sc_Seq(current.head__O()));
      var this$2 = current;
      current = this$2.tail__sci_List();
      i = ((1 + i) | 0)
    } else {
      break
    }
  };
  var j = arr.u.length;
  while ((j > 0)) {
    j = (((-1) + j) | 0);
    var frag = arr.get(j);
    var i$2 = 0;
    while ((i$2 < frag.length__I())) {
      $as_Ljapgolly_scalajs_react_vdom_TagMod(frag.apply__I__O(i$2)).applyTo__Ljapgolly_scalajs_react_vdom_Builder__V(b);
      i$2 = ((1 + i$2) | 0)
    }
  }
});
$c_Ljapgolly_scalajs_react_vdom_TagOf.prototype.applyTo__Ljapgolly_scalajs_react_vdom_Builder__V = (function(b) {
  var a = this.render__Ljapgolly_scalajs_react_vdom_VdomElement().rawElement$2;
  b.appendChild__sjs_js_$bar__V(a)
});
$c_Ljapgolly_scalajs_react_vdom_TagOf.prototype.render__Ljapgolly_scalajs_react_vdom_VdomElement = (function() {
  return ((!this.bitmap$0$1) ? this.render$lzycompute__p1__Ljapgolly_scalajs_react_vdom_VdomElement() : this.render$1)
});
var $d_Ljapgolly_scalajs_react_vdom_TagOf = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_TagOf: 0
}, false, "japgolly.scalajs.react.vdom.TagOf", {
  Ljapgolly_scalajs_react_vdom_TagOf: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_TagMod: 1
});
$c_Ljapgolly_scalajs_react_vdom_TagOf.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_TagOf;
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_VdomNode() {
  $c_O.call(this);
  this.rawNode$1 = null
}
$c_Ljapgolly_scalajs_react_vdom_VdomNode.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_VdomNode.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_VdomNode;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_VdomNode() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_VdomNode.prototype = $c_Ljapgolly_scalajs_react_vdom_VdomNode.prototype;
$c_Ljapgolly_scalajs_react_vdom_VdomNode.prototype.applyTo__Ljapgolly_scalajs_react_vdom_Builder__V = (function(b) {
  var a = this.rawNode$1;
  b.appendChild__sjs_js_$bar__V(a)
});
$c_Ljapgolly_scalajs_react_vdom_VdomNode.prototype.init___sjs_js_$bar = (function(rawNode) {
  this.rawNode$1 = rawNode;
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_VdomNode = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_VdomNode: 0
}, false, "japgolly.scalajs.react.vdom.VdomNode", {
  Ljapgolly_scalajs_react_vdom_VdomNode: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_TagMod: 1
});
$c_Ljapgolly_scalajs_react_vdom_VdomNode.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_VdomNode;
/** @constructor */
function $c_jl_Number() {
  $c_O.call(this)
}
$c_jl_Number.prototype = new $h_O();
$c_jl_Number.prototype.constructor = $c_jl_Number;
/** @constructor */
function $h_jl_Number() {
  /*<skip>*/
}
$h_jl_Number.prototype = $c_jl_Number.prototype;
function $is_jl_Number(obj) {
  return (!(!(((obj && obj.$classData) && obj.$classData.ancestors.jl_Number) || ((typeof obj) === "number"))))
}
function $as_jl_Number(obj) {
  return (($is_jl_Number(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Number"))
}
function $isArrayOf_jl_Number(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Number)))
}
function $asArrayOf_jl_Number(obj, depth) {
  return (($isArrayOf_jl_Number(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Number;", depth))
}
/** @constructor */
function $c_jl_Throwable() {
  $c_O.call(this);
  this.s$1 = null;
  this.e$1 = null;
  this.stackTrace$1 = null
}
$c_jl_Throwable.prototype = new $h_O();
$c_jl_Throwable.prototype.constructor = $c_jl_Throwable;
/** @constructor */
function $h_jl_Throwable() {
  /*<skip>*/
}
$h_jl_Throwable.prototype = $c_jl_Throwable.prototype;
$c_jl_Throwable.prototype.fillInStackTrace__jl_Throwable = (function() {
  var v = $g.Error.captureStackTrace;
  if ((v === (void 0))) {
    try {
      var e$1 = {}.undef()
    } catch (e) {
      var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
      if ((e$2 !== null)) {
        if ($is_sjs_js_JavaScriptException(e$2)) {
          var x5 = $as_sjs_js_JavaScriptException(e$2);
          var e$3 = x5.exception$4;
          var e$1 = e$3
        } else {
          var e$1;
          throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
        }
      } else {
        var e$1;
        throw e
      }
    };
    this.stackdata = e$1
  } else {
    $g.Error.captureStackTrace(this);
    this.stackdata = this
  };
  return this
});
$c_jl_Throwable.prototype.getMessage__T = (function() {
  return this.s$1
});
$c_jl_Throwable.prototype.toString__T = (function() {
  var className = $objectGetClass(this).getName__T();
  var message = this.getMessage__T();
  return ((message === null) ? className : ((className + ": ") + message))
});
$c_jl_Throwable.prototype.init___T__jl_Throwable = (function(s, e) {
  this.s$1 = s;
  this.e$1 = e;
  this.fillInStackTrace__jl_Throwable();
  return this
});
function $is_jl_Throwable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Throwable)))
}
function $as_jl_Throwable(obj) {
  return (($is_jl_Throwable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Throwable"))
}
function $isArrayOf_jl_Throwable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Throwable)))
}
function $asArrayOf_jl_Throwable(obj, depth) {
  return (($isArrayOf_jl_Throwable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Throwable;", depth))
}
/** @constructor */
function $c_ju_regex_Matcher() {
  $c_O.call(this);
  this.pattern0$1 = null;
  this.input0$1 = null;
  this.regionStart0$1 = 0;
  this.regionEnd0$1 = 0;
  this.regexp$1 = null;
  this.inputstr$1 = null;
  this.lastMatch$1 = null;
  this.lastMatchIsValid$1 = false;
  this.canStillFind$1 = false;
  this.appendPos$1 = 0
}
$c_ju_regex_Matcher.prototype = new $h_O();
$c_ju_regex_Matcher.prototype.constructor = $c_ju_regex_Matcher;
/** @constructor */
function $h_ju_regex_Matcher() {
  /*<skip>*/
}
$h_ju_regex_Matcher.prototype = $c_ju_regex_Matcher.prototype;
$c_ju_regex_Matcher.prototype.find__Z = (function() {
  if (this.canStillFind$1) {
    this.lastMatchIsValid$1 = true;
    this.lastMatch$1 = this.regexp$1.exec(this.inputstr$1);
    if ((this.lastMatch$1 !== null)) {
      var value = this.lastMatch$1[0];
      if ((value === (void 0))) {
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      };
      var thiz = $as_T(value);
      if ((thiz === null)) {
        throw new $c_jl_NullPointerException().init___()
      };
      if ((thiz === "")) {
        var ev$1 = this.regexp$1;
        ev$1.lastIndex = ((1 + $uI(ev$1.lastIndex)) | 0)
      }
    } else {
      this.canStillFind$1 = false
    };
    return (this.lastMatch$1 !== null)
  } else {
    return false
  }
});
$c_ju_regex_Matcher.prototype.ensureLastMatch__p1__sjs_js_RegExp$ExecResult = (function() {
  if ((this.lastMatch$1 === null)) {
    throw new $c_jl_IllegalStateException().init___T("No match available")
  };
  return this.lastMatch$1
});
$c_ju_regex_Matcher.prototype.group__I__T = (function(group) {
  var value = this.ensureLastMatch__p1__sjs_js_RegExp$ExecResult()[group];
  return $as_T(((value === (void 0)) ? null : value))
});
$c_ju_regex_Matcher.prototype.matches__Z = (function() {
  this.reset__ju_regex_Matcher();
  this.find__Z();
  if ((this.lastMatch$1 !== null)) {
    if ((this.start__I() !== 0)) {
      var jsx$1 = true
    } else {
      var jsx$2 = this.end__I();
      var thiz = this.inputstr$1;
      var jsx$1 = (jsx$2 !== $uI(thiz.length))
    }
  } else {
    var jsx$1 = false
  };
  if (jsx$1) {
    this.reset__ju_regex_Matcher()
  };
  return (this.lastMatch$1 !== null)
});
$c_ju_regex_Matcher.prototype.appendTail__jl_StringBuffer__jl_StringBuffer = (function(sb) {
  var thiz = this.inputstr$1;
  var beginIndex = this.appendPos$1;
  sb.append__T__jl_StringBuffer($as_T(thiz.substring(beginIndex)));
  var thiz$1 = this.inputstr$1;
  this.appendPos$1 = $uI(thiz$1.length);
  return sb
});
$c_ju_regex_Matcher.prototype.end__I = (function() {
  var jsx$1 = this.start__I();
  var thiz = this.group__T();
  return ((jsx$1 + $uI(thiz.length)) | 0)
});
$c_ju_regex_Matcher.prototype.init___ju_regex_Pattern__jl_CharSequence__I__I = (function(pattern0, input0, regionStart0, regionEnd0) {
  this.pattern0$1 = pattern0;
  this.input0$1 = input0;
  this.regionStart0$1 = regionStart0;
  this.regionEnd0$1 = regionEnd0;
  this.regexp$1 = this.pattern0$1.newJSRegExp__sjs_js_RegExp();
  this.inputstr$1 = $objectToString($charSequenceSubSequence(this.input0$1, this.regionStart0$1, this.regionEnd0$1));
  this.lastMatch$1 = null;
  this.lastMatchIsValid$1 = false;
  this.canStillFind$1 = true;
  this.appendPos$1 = 0;
  return this
});
$c_ju_regex_Matcher.prototype.appendReplacement__jl_StringBuffer__T__ju_regex_Matcher = (function(sb, replacement) {
  var thiz = this.inputstr$1;
  var beginIndex = this.appendPos$1;
  var endIndex = this.start__I();
  sb.append__T__jl_StringBuffer($as_T(thiz.substring(beginIndex, endIndex)));
  var len = $uI(replacement.length);
  var i = 0;
  while ((i < len)) {
    var index = i;
    var x1 = (65535 & $uI(replacement.charCodeAt(index)));
    switch (x1) {
      case 36: {
        i = ((1 + i) | 0);
        var j = i;
        while (true) {
          if ((i < len)) {
            var index$1 = i;
            var c = (65535 & $uI(replacement.charCodeAt(index$1)));
            var jsx$1 = ((c >= 48) && (c <= 57))
          } else {
            var jsx$1 = false
          };
          if (jsx$1) {
            i = ((1 + i) | 0)
          } else {
            break
          }
        };
        var this$8 = $m_jl_Integer$();
        var endIndex$1 = i;
        var s = $as_T(replacement.substring(j, endIndex$1));
        var group = this$8.parseInt__T__I__I(s, 10);
        sb.append__T__jl_StringBuffer(this.group__I__T(group));
        break
      }
      case 92: {
        i = ((1 + i) | 0);
        if ((i < len)) {
          var index$2 = i;
          sb.append__C__jl_StringBuffer((65535 & $uI(replacement.charCodeAt(index$2))))
        };
        i = ((1 + i) | 0);
        break
      }
      default: {
        sb.append__C__jl_StringBuffer(x1);
        i = ((1 + i) | 0)
      }
    }
  };
  this.appendPos$1 = this.end__I();
  return this
});
$c_ju_regex_Matcher.prototype.replaceFirst__T__T = (function(replacement) {
  this.reset__ju_regex_Matcher();
  if (this.find__Z()) {
    var sb = new $c_jl_StringBuffer().init___();
    this.appendReplacement__jl_StringBuffer__T__ju_regex_Matcher(sb, replacement);
    this.appendTail__jl_StringBuffer__jl_StringBuffer(sb);
    return sb.content$1
  } else {
    return this.inputstr$1
  }
});
$c_ju_regex_Matcher.prototype.replaceAll__T__T = (function(replacement) {
  this.reset__ju_regex_Matcher();
  var sb = new $c_jl_StringBuffer().init___();
  while (this.find__Z()) {
    this.appendReplacement__jl_StringBuffer__T__ju_regex_Matcher(sb, replacement)
  };
  this.appendTail__jl_StringBuffer__jl_StringBuffer(sb);
  return sb.content$1
});
$c_ju_regex_Matcher.prototype.group__T = (function() {
  var value = this.ensureLastMatch__p1__sjs_js_RegExp$ExecResult()[0];
  if ((value === (void 0))) {
    throw new $c_ju_NoSuchElementException().init___T("undefined.get")
  };
  return $as_T(value)
});
$c_ju_regex_Matcher.prototype.start__I = (function() {
  return $uI(this.ensureLastMatch__p1__sjs_js_RegExp$ExecResult().index)
});
$c_ju_regex_Matcher.prototype.reset__ju_regex_Matcher = (function() {
  this.regexp$1.lastIndex = 0;
  this.lastMatch$1 = null;
  this.lastMatchIsValid$1 = false;
  this.canStillFind$1 = true;
  this.appendPos$1 = 0;
  return this
});
function $is_ju_regex_Matcher(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.ju_regex_Matcher)))
}
function $as_ju_regex_Matcher(obj) {
  return (($is_ju_regex_Matcher(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.util.regex.Matcher"))
}
function $isArrayOf_ju_regex_Matcher(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.ju_regex_Matcher)))
}
function $asArrayOf_ju_regex_Matcher(obj, depth) {
  return (($isArrayOf_ju_regex_Matcher(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.util.regex.Matcher;", depth))
}
var $d_ju_regex_Matcher = new $TypeData().initClass({
  ju_regex_Matcher: 0
}, false, "java.util.regex.Matcher", {
  ju_regex_Matcher: 1,
  O: 1,
  ju_regex_MatchResult: 1
});
$c_ju_regex_Matcher.prototype.$classData = $d_ju_regex_Matcher;
/** @constructor */
function $c_s_Predef$$anon$3() {
  $c_O.call(this)
}
$c_s_Predef$$anon$3.prototype = new $h_O();
$c_s_Predef$$anon$3.prototype.constructor = $c_s_Predef$$anon$3;
/** @constructor */
function $h_s_Predef$$anon$3() {
  /*<skip>*/
}
$h_s_Predef$$anon$3.prototype = $c_s_Predef$$anon$3.prototype;
$c_s_Predef$$anon$3.prototype.apply__scm_Builder = (function() {
  return new $c_scm_StringBuilder().init___()
});
$c_s_Predef$$anon$3.prototype.init___ = (function() {
  return this
});
$c_s_Predef$$anon$3.prototype.apply__O__scm_Builder = (function(from) {
  $as_T(from);
  return new $c_scm_StringBuilder().init___()
});
var $d_s_Predef$$anon$3 = new $TypeData().initClass({
  s_Predef$$anon$3: 0
}, false, "scala.Predef$$anon$3", {
  s_Predef$$anon$3: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_s_Predef$$anon$3.prototype.$classData = $d_s_Predef$$anon$3;
function $f_s_Product2__productElement__I__O($thiz, n) {
  switch (n) {
    case 0: {
      return $thiz.$$und1$f;
      break
    }
    case 1: {
      return $thiz.$$und2$f;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
    }
  }
}
/** @constructor */
function $c_s_package$$anon$1() {
  $c_O.call(this)
}
$c_s_package$$anon$1.prototype = new $h_O();
$c_s_package$$anon$1.prototype.constructor = $c_s_package$$anon$1;
/** @constructor */
function $h_s_package$$anon$1() {
  /*<skip>*/
}
$h_s_package$$anon$1.prototype = $c_s_package$$anon$1.prototype;
$c_s_package$$anon$1.prototype.init___ = (function() {
  return this
});
$c_s_package$$anon$1.prototype.toString__T = (function() {
  return "object AnyRef"
});
var $d_s_package$$anon$1 = new $TypeData().initClass({
  s_package$$anon$1: 0
}, false, "scala.package$$anon$1", {
  s_package$$anon$1: 1,
  O: 1,
  s_Specializable: 1
});
$c_s_package$$anon$1.prototype.$classData = $d_s_package$$anon$1;
/** @constructor */
function $c_s_util_hashing_MurmurHash3$() {
  $c_s_util_hashing_MurmurHash3.call(this);
  this.seqSeed$2 = 0;
  this.mapSeed$2 = 0;
  this.setSeed$2 = 0
}
$c_s_util_hashing_MurmurHash3$.prototype = new $h_s_util_hashing_MurmurHash3();
$c_s_util_hashing_MurmurHash3$.prototype.constructor = $c_s_util_hashing_MurmurHash3$;
/** @constructor */
function $h_s_util_hashing_MurmurHash3$() {
  /*<skip>*/
}
$h_s_util_hashing_MurmurHash3$.prototype = $c_s_util_hashing_MurmurHash3$.prototype;
$c_s_util_hashing_MurmurHash3$.prototype.init___ = (function() {
  $n_s_util_hashing_MurmurHash3$ = this;
  this.seqSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Seq");
  this.mapSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Map");
  this.setSeed$2 = $m_sjsr_RuntimeString$().hashCode__T__I("Set");
  return this
});
$c_s_util_hashing_MurmurHash3$.prototype.seqHash__sc_Seq__I = (function(xs) {
  if ($is_sci_List(xs)) {
    var x2 = $as_sci_List(xs);
    return this.listHash__sci_List__I__I(x2, this.seqSeed$2)
  } else {
    return this.orderedHash__sc_TraversableOnce__I__I(xs, this.seqSeed$2)
  }
});
var $d_s_util_hashing_MurmurHash3$ = new $TypeData().initClass({
  s_util_hashing_MurmurHash3$: 0
}, false, "scala.util.hashing.MurmurHash3$", {
  s_util_hashing_MurmurHash3$: 1,
  s_util_hashing_MurmurHash3: 1,
  O: 1
});
$c_s_util_hashing_MurmurHash3$.prototype.$classData = $d_s_util_hashing_MurmurHash3$;
var $n_s_util_hashing_MurmurHash3$ = (void 0);
function $m_s_util_hashing_MurmurHash3$() {
  if ((!$n_s_util_hashing_MurmurHash3$)) {
    $n_s_util_hashing_MurmurHash3$ = new $c_s_util_hashing_MurmurHash3$().init___()
  };
  return $n_s_util_hashing_MurmurHash3$
}
function $f_sc_Iterator__isEmpty__Z($thiz) {
  return (!$thiz.hasNext__Z())
}
function $f_sc_Iterator__forall__F1__Z($thiz, p) {
  var res = true;
  while ((res && $thiz.hasNext__Z())) {
    res = $uZ(p.apply__O__O($thiz.next__O()))
  };
  return res
}
function $f_sc_Iterator__toString__T($thiz) {
  return (($thiz.hasNext__Z() ? "non-empty" : "empty") + " iterator")
}
function $f_sc_Iterator__foreach__F1__V($thiz, f) {
  while ($thiz.hasNext__Z()) {
    f.apply__O__O($thiz.next__O())
  }
}
function $f_sc_Iterator__toStream__sci_Stream($thiz) {
  if ($thiz.hasNext__Z()) {
    var hd = $thiz.next__O();
    var tl = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
      return (function() {
        return $this.toStream__sci_Stream()
      })
    })($thiz));
    return new $c_sci_Stream$Cons().init___O__F0(hd, tl)
  } else {
    $m_sci_Stream$();
    return $m_sci_Stream$Empty$()
  }
}
/** @constructor */
function $c_scg_GenSetFactory() {
  $c_scg_GenericCompanion.call(this)
}
$c_scg_GenSetFactory.prototype = new $h_scg_GenericCompanion();
$c_scg_GenSetFactory.prototype.constructor = $c_scg_GenSetFactory;
/** @constructor */
function $h_scg_GenSetFactory() {
  /*<skip>*/
}
$h_scg_GenSetFactory.prototype = $c_scg_GenSetFactory.prototype;
/** @constructor */
function $c_scg_GenTraversableFactory() {
  $c_scg_GenericCompanion.call(this);
  this.ReusableCBFInstance$2 = null
}
$c_scg_GenTraversableFactory.prototype = new $h_scg_GenericCompanion();
$c_scg_GenTraversableFactory.prototype.constructor = $c_scg_GenTraversableFactory;
/** @constructor */
function $h_scg_GenTraversableFactory() {
  /*<skip>*/
}
$h_scg_GenTraversableFactory.prototype = $c_scg_GenTraversableFactory.prototype;
$c_scg_GenTraversableFactory.prototype.init___ = (function() {
  this.ReusableCBFInstance$2 = new $c_scg_GenTraversableFactory$$anon$1().init___scg_GenTraversableFactory(this);
  return this
});
/** @constructor */
function $c_scg_GenTraversableFactory$GenericCanBuildFrom() {
  $c_O.call(this);
  this.$$outer$1 = null
}
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype = new $h_O();
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.constructor = $c_scg_GenTraversableFactory$GenericCanBuildFrom;
/** @constructor */
function $h_scg_GenTraversableFactory$GenericCanBuildFrom() {
  /*<skip>*/
}
$h_scg_GenTraversableFactory$GenericCanBuildFrom.prototype = $c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype;
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.apply__scm_Builder = (function() {
  return this.$$outer$1.newBuilder__scm_Builder()
});
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.apply__O__scm_Builder = (function(from) {
  var from$1 = $as_sc_GenTraversable(from);
  return from$1.companion__scg_GenericCompanion().newBuilder__scm_Builder()
});
$c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  return this
});
/** @constructor */
function $c_scg_MapFactory() {
  $c_scg_GenMapFactory.call(this)
}
$c_scg_MapFactory.prototype = new $h_scg_GenMapFactory();
$c_scg_MapFactory.prototype.constructor = $c_scg_MapFactory;
/** @constructor */
function $h_scg_MapFactory() {
  /*<skip>*/
}
$h_scg_MapFactory.prototype = $c_scg_MapFactory.prototype;
/** @constructor */
function $c_sci_List$$anon$1() {
  $c_O.call(this)
}
$c_sci_List$$anon$1.prototype = new $h_O();
$c_sci_List$$anon$1.prototype.constructor = $c_sci_List$$anon$1;
/** @constructor */
function $h_sci_List$$anon$1() {
  /*<skip>*/
}
$h_sci_List$$anon$1.prototype = $c_sci_List$$anon$1.prototype;
$c_sci_List$$anon$1.prototype.init___ = (function() {
  return this
});
$c_sci_List$$anon$1.prototype.apply__O__O = (function(x) {
  return this
});
$c_sci_List$$anon$1.prototype.toString__T = (function() {
  return "<function1>"
});
$c_sci_List$$anon$1.prototype.andThen__F1__F1 = (function(g) {
  return $f_F1__andThen__F1__F1(this, g)
});
var $d_sci_List$$anon$1 = new $TypeData().initClass({
  sci_List$$anon$1: 0
}, false, "scala.collection.immutable.List$$anon$1", {
  sci_List$$anon$1: 1,
  O: 1,
  F1: 1
});
$c_sci_List$$anon$1.prototype.$classData = $d_sci_List$$anon$1;
function $f_scm_Builder__sizeHint__sc_TraversableLike__V($thiz, coll) {
  var x1 = coll.sizeHintIfCheap__I();
  switch (x1) {
    case (-1): {
      break
    }
    default: {
      $thiz.sizeHint__I__V(x1)
    }
  }
}
function $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V($thiz, size, boundingColl) {
  var x1 = boundingColl.sizeHintIfCheap__I();
  switch (x1) {
    case (-1): {
      break
    }
    default: {
      $thiz.sizeHint__I__V(((size < x1) ? size : x1))
    }
  }
}
function $is_scm_Builder(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_Builder)))
}
function $as_scm_Builder(obj) {
  return (($is_scm_Builder(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.Builder"))
}
function $isArrayOf_scm_Builder(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_Builder)))
}
function $asArrayOf_scm_Builder(obj, depth) {
  return (($isArrayOf_scm_Builder(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.Builder;", depth))
}
/** @constructor */
function $c_sr_AbstractFunction0() {
  $c_O.call(this)
}
$c_sr_AbstractFunction0.prototype = new $h_O();
$c_sr_AbstractFunction0.prototype.constructor = $c_sr_AbstractFunction0;
/** @constructor */
function $h_sr_AbstractFunction0() {
  /*<skip>*/
}
$h_sr_AbstractFunction0.prototype = $c_sr_AbstractFunction0.prototype;
$c_sr_AbstractFunction0.prototype.toString__T = (function() {
  return "<function0>"
});
/** @constructor */
function $c_sr_AbstractFunction1() {
  $c_O.call(this)
}
$c_sr_AbstractFunction1.prototype = new $h_O();
$c_sr_AbstractFunction1.prototype.constructor = $c_sr_AbstractFunction1;
/** @constructor */
function $h_sr_AbstractFunction1() {
  /*<skip>*/
}
$h_sr_AbstractFunction1.prototype = $c_sr_AbstractFunction1.prototype;
$c_sr_AbstractFunction1.prototype.toString__T = (function() {
  return "<function1>"
});
$c_sr_AbstractFunction1.prototype.andThen__F1__F1 = (function(g) {
  return $f_F1__andThen__F1__F1(this, g)
});
/** @constructor */
function $c_sr_AbstractFunction2() {
  $c_O.call(this)
}
$c_sr_AbstractFunction2.prototype = new $h_O();
$c_sr_AbstractFunction2.prototype.constructor = $c_sr_AbstractFunction2;
/** @constructor */
function $h_sr_AbstractFunction2() {
  /*<skip>*/
}
$h_sr_AbstractFunction2.prototype = $c_sr_AbstractFunction2.prototype;
$c_sr_AbstractFunction2.prototype.toString__T = (function() {
  return "<function2>"
});
/** @constructor */
function $c_sr_AbstractFunction3() {
  $c_O.call(this)
}
$c_sr_AbstractFunction3.prototype = new $h_O();
$c_sr_AbstractFunction3.prototype.constructor = $c_sr_AbstractFunction3;
/** @constructor */
function $h_sr_AbstractFunction3() {
  /*<skip>*/
}
$h_sr_AbstractFunction3.prototype = $c_sr_AbstractFunction3.prototype;
$c_sr_AbstractFunction3.prototype.toString__T = (function() {
  return "<function3>"
});
/** @constructor */
function $c_sr_BooleanRef() {
  $c_O.call(this);
  this.elem$1 = false
}
$c_sr_BooleanRef.prototype = new $h_O();
$c_sr_BooleanRef.prototype.constructor = $c_sr_BooleanRef;
/** @constructor */
function $h_sr_BooleanRef() {
  /*<skip>*/
}
$h_sr_BooleanRef.prototype = $c_sr_BooleanRef.prototype;
$c_sr_BooleanRef.prototype.toString__T = (function() {
  var value = this.elem$1;
  return ("" + value)
});
$c_sr_BooleanRef.prototype.init___Z = (function(elem) {
  this.elem$1 = elem;
  return this
});
var $d_sr_BooleanRef = new $TypeData().initClass({
  sr_BooleanRef: 0
}, false, "scala.runtime.BooleanRef", {
  sr_BooleanRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sr_BooleanRef.prototype.$classData = $d_sr_BooleanRef;
function $isArrayOf_sr_BoxedUnit(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sr_BoxedUnit)))
}
function $asArrayOf_sr_BoxedUnit(obj, depth) {
  return (($isArrayOf_sr_BoxedUnit(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.runtime.BoxedUnit;", depth))
}
var $d_sr_BoxedUnit = new $TypeData().initClass({
  sr_BoxedUnit: 0
}, false, "scala.runtime.BoxedUnit", {
  sr_BoxedUnit: 1,
  O: 1,
  Ljava_io_Serializable: 1
}, (void 0), (void 0), (function(x) {
  return (x === (void 0))
}));
/** @constructor */
function $c_sr_IntRef() {
  $c_O.call(this);
  this.elem$1 = 0
}
$c_sr_IntRef.prototype = new $h_O();
$c_sr_IntRef.prototype.constructor = $c_sr_IntRef;
/** @constructor */
function $h_sr_IntRef() {
  /*<skip>*/
}
$h_sr_IntRef.prototype = $c_sr_IntRef.prototype;
$c_sr_IntRef.prototype.toString__T = (function() {
  var value = this.elem$1;
  return ("" + value)
});
$c_sr_IntRef.prototype.init___I = (function(elem) {
  this.elem$1 = elem;
  return this
});
var $d_sr_IntRef = new $TypeData().initClass({
  sr_IntRef: 0
}, false, "scala.runtime.IntRef", {
  sr_IntRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sr_IntRef.prototype.$classData = $d_sr_IntRef;
/** @constructor */
function $c_sr_ObjectRef() {
  $c_O.call(this);
  this.elem$1 = null
}
$c_sr_ObjectRef.prototype = new $h_O();
$c_sr_ObjectRef.prototype.constructor = $c_sr_ObjectRef;
/** @constructor */
function $h_sr_ObjectRef() {
  /*<skip>*/
}
$h_sr_ObjectRef.prototype = $c_sr_ObjectRef.prototype;
$c_sr_ObjectRef.prototype.toString__T = (function() {
  return $m_sjsr_RuntimeString$().valueOf__O__T(this.elem$1)
});
$c_sr_ObjectRef.prototype.init___O = (function(elem) {
  this.elem$1 = elem;
  return this
});
var $d_sr_ObjectRef = new $TypeData().initClass({
  sr_ObjectRef: 0
}, false, "scala.runtime.ObjectRef", {
  sr_ObjectRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_sr_ObjectRef.prototype.$classData = $d_sr_ObjectRef;
function $is_Ljapgolly_scalajs_react_component_Generic$MountedWithRoot(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_component_Generic$MountedWithRoot)))
}
function $as_Ljapgolly_scalajs_react_component_Generic$MountedWithRoot(obj) {
  return (($is_Ljapgolly_scalajs_react_component_Generic$MountedWithRoot(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.component.Generic$MountedWithRoot"))
}
function $isArrayOf_Ljapgolly_scalajs_react_component_Generic$MountedWithRoot(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_component_Generic$MountedWithRoot)))
}
function $asArrayOf_Ljapgolly_scalajs_react_component_Generic$MountedWithRoot(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_component_Generic$MountedWithRoot(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.component.Generic$MountedWithRoot;", depth))
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$.prototype.constructor = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$.prototype = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$.prototype;
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$.prototype.shouldComponentUpdate__Ljapgolly_scalajs_react_internal_Lens = (function() {
  $m_Ljapgolly_scalajs_react_internal_Lens$();
  var get = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$36$2) {
      var x$36 = $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle(x$36$2);
      return x$36.shouldComponentUpdate$1
    })
  })(this));
  var set = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2) {
    return (function(n$2) {
      var n = $as_s_Option(n$2);
      return new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1, n$1) {
        return (function(x$37$2) {
          var x$37 = $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle(x$37$2);
          var x$44 = x$37.componentDidMount$1;
          var x$45 = x$37.componentDidUpdate$1;
          var x$46 = x$37.componentWillMount$1;
          var x$47 = x$37.componentWillReceiveProps$1;
          var x$48 = x$37.componentWillUnmount$1;
          var x$49 = x$37.componentWillUpdate$1;
          return new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle().init___s_Option__s_Option__s_Option__s_Option__s_Option__s_Option__s_Option(x$44, x$45, x$46, x$47, x$48, x$49, n$1)
        })
      })(this$2, n))
    })
  })(this));
  return new $c_Ljapgolly_scalajs_react_internal_Lens().init___F1__F1(get, set)
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$.prototype.componentDidUpdate__Ljapgolly_scalajs_react_internal_Lens = (function() {
  $m_Ljapgolly_scalajs_react_internal_Lens$();
  var get = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$26$2) {
      var x$26 = $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle(x$26$2);
      return x$26.componentDidUpdate$1
    })
  })(this));
  var set = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2) {
    return (function(n$2) {
      var n = $as_s_Option(n$2);
      return new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1, n$1) {
        return (function(x$27$2) {
          var x$27 = $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle(x$27$2);
          var x$79 = x$27.componentDidMount$1;
          var x$80 = x$27.componentWillMount$1;
          var x$81 = x$27.componentWillReceiveProps$1;
          var x$82 = x$27.componentWillUnmount$1;
          var x$83 = x$27.componentWillUpdate$1;
          var x$84 = x$27.shouldComponentUpdate$1;
          return new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle().init___s_Option__s_Option__s_Option__s_Option__s_Option__s_Option__s_Option(x$79, n$1, x$80, x$81, x$82, x$83, x$84)
        })
      })(this$2, n))
    })
  })(this));
  return new $c_Ljapgolly_scalajs_react_internal_Lens().init___F1__F1(get, set)
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$.prototype.japgolly$scalajs$react$component$ScalaBuilder$Lifecycle$$wrapTostring__T__T = (function(toString) {
  var thiz = $m_sjsr_RuntimeString$().replaceAll__T__T__T__T(toString, "undefined \u2192 undefined", "undefined");
  var thiz$1 = $as_T(thiz.split("props: undefined, ").join(""));
  var thiz$2 = $as_T(thiz$1.split("state: undefined)").join(")"));
  return $as_T(thiz$2.split(", )").join(")"))
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$.prototype.componentWillUnmount__Ljapgolly_scalajs_react_internal_Lens = (function() {
  $m_Ljapgolly_scalajs_react_internal_Lens$();
  var get = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$30$2) {
      var x$30 = $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle(x$30$2);
      return x$30.componentWillUnmount$1
    })
  })(this));
  var set = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2) {
    return (function(n$2) {
      var n = $as_s_Option(n$2);
      return new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1, n$1) {
        return (function(x$31$2) {
          var x$31 = $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle(x$31$2);
          var x$58 = x$31.componentDidMount$1;
          var x$59 = x$31.componentDidUpdate$1;
          var x$60 = x$31.componentWillMount$1;
          var x$61 = x$31.componentWillReceiveProps$1;
          var x$62 = x$31.componentWillUpdate$1;
          var x$63 = x$31.shouldComponentUpdate$1;
          return new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle().init___s_Option__s_Option__s_Option__s_Option__s_Option__s_Option__s_Option(x$58, x$59, x$60, x$61, n$1, x$62, x$63)
        })
      })(this$2, n))
    })
  })(this));
  return new $c_Ljapgolly_scalajs_react_internal_Lens().init___F1__F1(get, set)
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$.prototype.componentDidMount__Ljapgolly_scalajs_react_internal_Lens = (function() {
  $m_Ljapgolly_scalajs_react_internal_Lens$();
  var get = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$24$2) {
      var x$24 = $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle(x$24$2);
      return x$24.componentDidMount$1
    })
  })(this));
  var set = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2) {
    return (function(n$2) {
      var n = $as_s_Option(n$2);
      return new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1, n$1) {
        return (function(x$25$2) {
          var x$25 = $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle(x$25$2);
          var componentDidUpdate = x$25.componentDidUpdate$1;
          var componentWillMount = x$25.componentWillMount$1;
          var componentWillReceiveProps = x$25.componentWillReceiveProps$1;
          var componentWillUnmount = x$25.componentWillUnmount$1;
          var componentWillUpdate = x$25.componentWillUpdate$1;
          var shouldComponentUpdate = x$25.shouldComponentUpdate$1;
          return new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle().init___s_Option__s_Option__s_Option__s_Option__s_Option__s_Option__s_Option(n$1, componentDidUpdate, componentWillMount, componentWillReceiveProps, componentWillUnmount, componentWillUpdate, shouldComponentUpdate)
        })
      })(this$2, n))
    })
  })(this));
  return new $c_Ljapgolly_scalajs_react_internal_Lens().init___F1__F1(get, set)
});
var $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$: 0
}, false, "japgolly.scalajs.react.component.ScalaBuilder$Lifecycle$", {
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$.prototype.$classData = $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$;
var $n_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ = (void 0);
function $m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$() {
  if ((!$n_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$)) {
    $n_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ = new $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$().init___()
  };
  return $n_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_AbsUrl$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_extra_router_AbsUrl$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_router_AbsUrl$.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_AbsUrl$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_AbsUrl$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_AbsUrl$.prototype = $c_Ljapgolly_scalajs_react_extra_router_AbsUrl$.prototype;
$c_Ljapgolly_scalajs_react_extra_router_AbsUrl$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_AbsUrl$.prototype.fromWindow__Ljapgolly_scalajs_react_extra_router_AbsUrl = (function() {
  return new $c_Ljapgolly_scalajs_react_extra_router_AbsUrl().init___T($as_T($m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().location.href))
});
var $d_Ljapgolly_scalajs_react_extra_router_AbsUrl$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_AbsUrl$: 0
}, false, "japgolly.scalajs.react.extra.router.AbsUrl$", {
  Ljapgolly_scalajs_react_extra_router_AbsUrl$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_extra_router_AbsUrl$.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_AbsUrl$;
var $n_Ljapgolly_scalajs_react_extra_router_AbsUrl$ = (void 0);
function $m_Ljapgolly_scalajs_react_extra_router_AbsUrl$() {
  if ((!$n_Ljapgolly_scalajs_react_extra_router_AbsUrl$)) {
    $n_Ljapgolly_scalajs_react_extra_router_AbsUrl$ = new $c_Ljapgolly_scalajs_react_extra_router_AbsUrl$().init___()
  };
  return $n_Ljapgolly_scalajs_react_extra_router_AbsUrl$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_BaseUrl$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_extra_router_BaseUrl$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_router_BaseUrl$.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_BaseUrl$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_BaseUrl$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_BaseUrl$.prototype = $c_Ljapgolly_scalajs_react_extra_router_BaseUrl$.prototype;
$c_Ljapgolly_scalajs_react_extra_router_BaseUrl$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_BaseUrl$.prototype.fromWindowOrigin__Ljapgolly_scalajs_react_extra_router_BaseUrl = (function() {
  var l = $m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().location;
  var url = (($as_T(l.protocol) + "//") + $as_T(l.hostname));
  var thiz = $as_T(l.port);
  if ((thiz === null)) {
    throw new $c_jl_NullPointerException().init___()
  };
  if ((!$m_ju_regex_Pattern$().matches__T__jl_CharSequence__Z("^(?:80)?$", thiz))) {
    url = ((url + ":") + $as_T(l.port))
  };
  return new $c_Ljapgolly_scalajs_react_extra_router_BaseUrl().init___T(url)
});
var $d_Ljapgolly_scalajs_react_extra_router_BaseUrl$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_BaseUrl$: 0
}, false, "japgolly.scalajs.react.extra.router.BaseUrl$", {
  Ljapgolly_scalajs_react_extra_router_BaseUrl$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_extra_router_BaseUrl$.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_BaseUrl$;
var $n_Ljapgolly_scalajs_react_extra_router_BaseUrl$ = (void 0);
function $m_Ljapgolly_scalajs_react_extra_router_BaseUrl$() {
  if ((!$n_Ljapgolly_scalajs_react_extra_router_BaseUrl$)) {
    $n_Ljapgolly_scalajs_react_extra_router_BaseUrl$ = new $c_Ljapgolly_scalajs_react_extra_router_BaseUrl$().init___()
  };
  return $n_Ljapgolly_scalajs_react_extra_router_BaseUrl$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_RouterConfig$() {
  $c_O.call(this);
  this.nopLogger$1 = null
}
$c_Ljapgolly_scalajs_react_extra_router_RouterConfig$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_router_RouterConfig$.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_RouterConfig$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_RouterConfig$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_RouterConfig$.prototype = $c_Ljapgolly_scalajs_react_extra_router_RouterConfig$.prototype;
$c_Ljapgolly_scalajs_react_extra_router_RouterConfig$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_extra_router_RouterConfig$ = this;
  this.nopLogger$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(y$2) {
      $as_F0(y$2);
      var x = new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0($m_Ljapgolly_scalajs_react_Callback$().empty$1);
      return new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0(x.japgolly$scalajs$react$CallbackTo$$f$1)
    })
  })(this));
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfig$.prototype.defaultPostRenderFn__F2 = (function() {
  var cb = $m_Ljapgolly_scalajs_react_Callback$().apply__F0__Ljapgolly_scalajs_react_Callback$ResultGuard__F0(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
    return (function() {
      $m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().scrollTo(0, 0)
    })
  })(this)), null);
  return new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function(this$2, cb$1) {
    return (function(x$9$2, x$10$2) {
      $as_s_Option(x$9$2);
      return new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0(cb$1)
    })
  })(this, cb))
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfig$.prototype.defaultRenderFn__F2 = (function() {
  return new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function($this) {
    return (function(x$8$2, r$2) {
      $as_Ljapgolly_scalajs_react_extra_router_RouterCtl(x$8$2);
      var r = $as_Ljapgolly_scalajs_react_extra_router_Resolution(r$2);
      return $as_Ljapgolly_scalajs_react_vdom_VdomElement(r.render$1.apply__O())
    })
  })(this))
});
var $d_Ljapgolly_scalajs_react_extra_router_RouterConfig$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_RouterConfig$: 0
}, false, "japgolly.scalajs.react.extra.router.RouterConfig$", {
  Ljapgolly_scalajs_react_extra_router_RouterConfig$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfig$.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_RouterConfig$;
var $n_Ljapgolly_scalajs_react_extra_router_RouterConfig$ = (void 0);
function $m_Ljapgolly_scalajs_react_extra_router_RouterConfig$() {
  if ((!$n_Ljapgolly_scalajs_react_extra_router_RouterConfig$)) {
    $n_Ljapgolly_scalajs_react_extra_router_RouterConfig$ = new $c_Ljapgolly_scalajs_react_extra_router_RouterConfig$().init___()
  };
  return $n_Ljapgolly_scalajs_react_extra_router_RouterConfig$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_RouterLogic() {
  $c_O.call(this);
  this.baseUrl$1 = null;
  this.cfg$1 = null;
  this.syncToWindowUrl$1 = null;
  this.ctlByPath$1 = null;
  this.ctl$1 = null;
  this.japgolly$scalajs$react$extra$Broadcaster$$$undlisteners$1 = null
}
$c_Ljapgolly_scalajs_react_extra_router_RouterLogic.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_router_RouterLogic.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_RouterLogic;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_RouterLogic() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_RouterLogic.prototype = $c_Ljapgolly_scalajs_react_extra_router_RouterLogic.prototype;
$c_Ljapgolly_scalajs_react_extra_router_RouterLogic.prototype.init___Ljapgolly_scalajs_react_extra_router_BaseUrl__Ljapgolly_scalajs_react_extra_router_RouterConfig = (function(baseUrl, cfg) {
  this.baseUrl$1 = baseUrl;
  this.cfg$1 = cfg;
  this.japgolly$scalajs$react$extra$Broadcaster$$$undlisteners$1 = ($m_sci_List$(), $m_sci_Nil$());
  var jsx$1 = $m_Ljapgolly_scalajs_react_CallbackTo$();
  var f = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
    return (function() {
      return $m_Ljapgolly_scalajs_react_extra_router_AbsUrl$().fromWindow__Ljapgolly_scalajs_react_extra_router_AbsUrl()
    })
  })(this));
  this.syncToWindowUrl$1 = jsx$1.flatMap$extension__F0__F1__F0(f, new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$1) {
    return (function(url$2) {
      var url = $as_Ljapgolly_scalajs_react_extra_router_AbsUrl(url$2);
      return new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0($m_Ljapgolly_scalajs_react_CallbackTo$().flatMap$extension__F0__F1__F0($as_Ljapgolly_scalajs_react_CallbackTo(this$2$1.cfg$1.logger$1.apply__O__O(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this$1, url$1) {
        return (function() {
          return new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["Syncing to ", "."])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([url$1]))
        })
      })(this$2$1, url)))).japgolly$scalajs$react$CallbackTo$$f$1, new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$2, url$3) {
        return (function(_$2) {
          $asUnit(_$2);
          return new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0($m_Ljapgolly_scalajs_react_CallbackTo$().flatMap$extension__F0__F1__F0(this$2$2.interpret__Ljapgolly_scalajs_react_extra_router_RouteCmd__F0(this$2$2.syncToUrl__Ljapgolly_scalajs_react_extra_router_AbsUrl__Ljapgolly_scalajs_react_extra_router_RouteCmd(url$3)), new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$2) {
            return (function(res$2) {
              var res = $as_Ljapgolly_scalajs_react_extra_router_Resolution(res$2);
              return new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0($m_Ljapgolly_scalajs_react_CallbackTo$().flatMap$extension__F0__F1__F0($as_Ljapgolly_scalajs_react_CallbackTo($this$2.cfg$1.logger$1.apply__O__O(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this$3, res$1) {
                return (function() {
                  return new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["Resolved to page ", "."])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([res$1.page$1]))
                })
              })($this$2, res)))).japgolly$scalajs$react$CallbackTo$$f$1, new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$3, res$3) {
                return (function(_$2$1) {
                  $asUnit(_$2$1);
                  return new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0($m_Ljapgolly_scalajs_react_CallbackTo$().map$extension__F0__F1__Ljapgolly_scalajs_react_CallbackTo$MapGuard__F0($as_Ljapgolly_scalajs_react_CallbackTo(this$2$3.cfg$1.logger$1.apply__O__O(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this$4) {
                    return (function() {
                      return ""
                    })
                  })(this$2$3)))).japgolly$scalajs$react$CallbackTo$$f$1, new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$4, res$1$1) {
                    return (function(_$2$2) {
                      $asUnit(_$2$2);
                      return res$1$1
                    })
                  })(this$2$3, res$3)), null))
                })
              })($this$2, res))))
            })
          })(this$2$2))))
        })
      })(this$2$1, url))))
    })
  })(this)));
  this.ctlByPath$1 = new $c_Ljapgolly_scalajs_react_extra_router_RouterLogic$$anon$1().init___Ljapgolly_scalajs_react_extra_router_RouterLogic(this);
  var this$3 = this.ctlByPath$1;
  var f$1 = cfg.path$1;
  this.ctl$1 = new $c_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap().init___Ljapgolly_scalajs_react_extra_router_RouterCtl__F1(this$3, f$1);
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_RouterLogic.prototype.redirectToPath__Ljapgolly_scalajs_react_extra_router_Path__Ljapgolly_scalajs_react_extra_router_Redirect$Method__Ljapgolly_scalajs_react_extra_router_RouteCmd = (function(path, method) {
  var msg = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, path$1, method$1) {
    return (function() {
      var jsx$2 = new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["Redirecting to ", " via ", "."]));
      var base = $this.baseUrl$1;
      return jsx$2.s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([base.apply__Ljapgolly_scalajs_react_extra_router_Path__Ljapgolly_scalajs_react_extra_router_AbsUrl(path$1), method$1]))
    })
  })(this, path, method));
  var jsx$1 = new $c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log().init___F0(msg).$$greater$greater__Ljapgolly_scalajs_react_extra_router_RouteCmd__Ljapgolly_scalajs_react_extra_router_RouteCmd(this.redirectCmd__Ljapgolly_scalajs_react_extra_router_Path__Ljapgolly_scalajs_react_extra_router_Redirect$Method__Ljapgolly_scalajs_react_extra_router_RouteCmd(path, method));
  var base$1 = this.baseUrl$1;
  return jsx$1.$$greater$greater__Ljapgolly_scalajs_react_extra_router_RouteCmd__Ljapgolly_scalajs_react_extra_router_RouteCmd(this.syncToUrl__Ljapgolly_scalajs_react_extra_router_AbsUrl__Ljapgolly_scalajs_react_extra_router_RouteCmd(base$1.apply__Ljapgolly_scalajs_react_extra_router_Path__Ljapgolly_scalajs_react_extra_router_AbsUrl(path)))
});
$c_Ljapgolly_scalajs_react_extra_router_RouterLogic.prototype.syncToUrl__Ljapgolly_scalajs_react_extra_router_AbsUrl__Ljapgolly_scalajs_react_extra_router_RouteCmd = (function(url) {
  var x1 = this.parseUrl__Ljapgolly_scalajs_react_extra_router_AbsUrl__s_Option(url);
  if ($is_s_Some(x1)) {
    var x2 = $as_s_Some(x1);
    var path = $as_Ljapgolly_scalajs_react_extra_router_Path(x2.value$2);
    return this.syncToPath__Ljapgolly_scalajs_react_extra_router_Path__Ljapgolly_scalajs_react_extra_router_RouteCmd(path)
  } else {
    var x = $m_s_None$();
    if ((x === x1)) {
      return this.wrongBase__Ljapgolly_scalajs_react_extra_router_AbsUrl__Ljapgolly_scalajs_react_extra_router_RouteCmd(url)
    } else {
      throw new $c_s_MatchError().init___O(x1)
    }
  }
});
$c_Ljapgolly_scalajs_react_extra_router_RouterLogic.prototype.render__Ljapgolly_scalajs_react_extra_router_Resolution__Ljapgolly_scalajs_react_vdom_VdomElement = (function(r) {
  return $as_Ljapgolly_scalajs_react_vdom_VdomElement(this.cfg$1.renderFn$1.apply__O__O__O(this.ctl$1, r))
});
$c_Ljapgolly_scalajs_react_extra_router_RouterLogic.prototype.parseUrl__Ljapgolly_scalajs_react_extra_router_AbsUrl__s_Option = (function(url) {
  var thiz = url.value$2;
  var prefix = this.baseUrl$1.value$2;
  if ((($uI(thiz.length) >= 0) && ($as_T(thiz.substring(0, $uI(prefix.length))) === prefix))) {
    var thiz$2 = url.value$2;
    var thiz$1 = this.baseUrl$1.value$2;
    var beginIndex = $uI(thiz$1.length);
    return new $c_s_Some().init___O(new $c_Ljapgolly_scalajs_react_extra_router_Path().init___T($as_T(thiz$2.substring(beginIndex))))
  } else {
    return $m_s_None$()
  }
});
$c_Ljapgolly_scalajs_react_extra_router_RouterLogic.prototype.interpret__Ljapgolly_scalajs_react_extra_router_RouteCmd__F0 = (function(r) {
  if ($is_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState(r)) {
    var x2 = $as_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState(r);
    var url = x2.url$2;
    var f = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, url$1) {
      return (function() {
        $m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().history.pushState({}, "", url$1.value$2)
      })
    })(this, url));
    var runBefore = $as_Ljapgolly_scalajs_react_CallbackTo(this.cfg$1.logger$1.apply__O__O(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2, url$2) {
      return (function() {
        return new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["PushState: [", "]"])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([url$2.value$2]))
      })
    })(this, url)))).japgolly$scalajs$react$CallbackTo$$f$1;
    var ev$1 = new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0($m_Ljapgolly_scalajs_react_CallbackTo$().$$greater$greater$extension__F0__F0__F0(runBefore, f));
    return ev$1.japgolly$scalajs$react$CallbackTo$$f$1
  } else if ($is_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState(r)) {
    var x3 = $as_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState(r);
    var url$2$1 = x3.url$2;
    var f$1 = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$3$1, url$2$2) {
      return (function() {
        $m_Lorg_scalajs_dom_package$().window__Lorg_scalajs_dom_raw_Window().history.replaceState({}, "", url$2$2.value$2)
      })
    })(this, url$2$1));
    var runBefore$1 = $as_Ljapgolly_scalajs_react_CallbackTo(this.cfg$1.logger$1.apply__O__O(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$4$1, url$2$3) {
      return (function() {
        return new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["ReplaceState: [", "]"])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([url$2$3.value$2]))
      })
    })(this, url$2$1)))).japgolly$scalajs$react$CallbackTo$$f$1;
    var ev$2 = new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0($m_Ljapgolly_scalajs_react_CallbackTo$().$$greater$greater$extension__F0__F0__F0(runBefore$1, f$1));
    return ev$2.japgolly$scalajs$react$CallbackTo$$f$1
  } else {
    var x = $m_Ljapgolly_scalajs_react_extra_router_RouteCmd$BroadcastSync$();
    if ((x === r)) {
      var $$this = $f_Ljapgolly_scalajs_react_extra_Broadcaster__broadcast__O__F0(this, (void 0));
      var runBefore$2 = $as_Ljapgolly_scalajs_react_CallbackTo(this.cfg$1.logger$1.apply__O__O(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$5$1) {
        return (function() {
          return "Broadcasting sync request."
        })
      })(this)))).japgolly$scalajs$react$CallbackTo$$f$1;
      var ev$3 = new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0($m_Ljapgolly_scalajs_react_CallbackTo$().$$greater$greater$extension__F0__F0__F0(runBefore$2, $$this));
      return ev$3.japgolly$scalajs$react$CallbackTo$$f$1
    } else if ($is_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return(r)) {
      var x4 = $as_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return(r);
      var a = x4.a$2;
      return $m_Ljapgolly_scalajs_react_CallbackTo$().pure__O__F0(a)
    } else if ($is_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log(r)) {
      var x5 = $as_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log(r);
      var msg = x5.msg$2;
      var ev$4 = this.cfg$1.logger$1.apply__O__O(msg);
      return ((ev$4 === null) ? null : $as_Ljapgolly_scalajs_react_CallbackTo(ev$4).japgolly$scalajs$react$CallbackTo$$f$1)
    } else if ($is_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence(r)) {
      var x6 = $as_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence(r);
      var a$2 = x6.init$2;
      var b = x6.last$2;
      var jsx$1 = $m_Ljapgolly_scalajs_react_CallbackTo$();
      var z = new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0($m_Ljapgolly_scalajs_react_Callback$().empty$1);
      var elem$1 = null;
      elem$1 = z;
      var this$8 = a$2.iterator__sci_VectorIterator();
      while (this$8.$$undhasNext$2) {
        var arg1 = this$8.next__O();
        var arg1$1 = elem$1;
        var x$8 = $as_Ljapgolly_scalajs_react_CallbackTo(arg1$1).japgolly$scalajs$react$CallbackTo$$f$1;
        var x$9 = $as_Ljapgolly_scalajs_react_extra_router_RouteCmd(arg1);
        elem$1 = new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0($m_Ljapgolly_scalajs_react_CallbackTo$().$$greater$greater$extension__F0__F0__F0(x$8, this.interpret__Ljapgolly_scalajs_react_extra_router_RouteCmd__F0(x$9)))
      };
      return jsx$1.$$greater$greater$extension__F0__F0__F0($as_Ljapgolly_scalajs_react_CallbackTo(elem$1).japgolly$scalajs$react$CallbackTo$$f$1, this.interpret__Ljapgolly_scalajs_react_extra_router_RouteCmd__F0(b))
    } else {
      throw new $c_s_MatchError().init___O(r)
    }
  }
});
$c_Ljapgolly_scalajs_react_extra_router_RouterLogic.prototype.wrongBase__Ljapgolly_scalajs_react_extra_router_AbsUrl__Ljapgolly_scalajs_react_extra_router_RouteCmd = (function(wrongUrl) {
  var root = new $c_Ljapgolly_scalajs_react_extra_router_Path().init___T("");
  var msg = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, wrongUrl$1, root$1) {
    return (function() {
      var jsx$1 = new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["Wrong base: ", " is outside of ", "."]));
      var base = $this.baseUrl$1;
      return jsx$1.s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([wrongUrl$1, base.apply__Ljapgolly_scalajs_react_extra_router_Path__Ljapgolly_scalajs_react_extra_router_AbsUrl(root$1)]))
    })
  })(this, wrongUrl, root));
  return new $c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log().init___F0(msg).$$greater$greater__Ljapgolly_scalajs_react_extra_router_RouteCmd__Ljapgolly_scalajs_react_extra_router_RouteCmd(this.redirectToPath__Ljapgolly_scalajs_react_extra_router_Path__Ljapgolly_scalajs_react_extra_router_Redirect$Method__Ljapgolly_scalajs_react_extra_router_RouteCmd(root, $m_Ljapgolly_scalajs_react_extra_router_Redirect$Push$()))
});
$c_Ljapgolly_scalajs_react_extra_router_RouterLogic.prototype.cmdOrPure__p1__s_util_Either__Ljapgolly_scalajs_react_extra_router_RouteCmd = (function(e) {
  var fa = $m_Ljapgolly_scalajs_react_internal_package$().identityFnInstance$1;
  if ($is_s_util_Right(e)) {
    var x2 = $as_s_util_Right(e);
    var b = x2.value$2;
    var jsx$1 = new $c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return().init___O(b)
  } else {
    if ((!$is_s_util_Left(e))) {
      throw new $c_s_MatchError().init___O(e)
    };
    var x3 = $as_s_util_Left(e);
    var a = x3.value$2;
    var jsx$1 = fa.apply__O__O(a)
  };
  return $as_Ljapgolly_scalajs_react_extra_router_RouteCmd(jsx$1)
});
$c_Ljapgolly_scalajs_react_extra_router_RouterLogic.prototype.redirectCmd__Ljapgolly_scalajs_react_extra_router_Path__Ljapgolly_scalajs_react_extra_router_Redirect$Method__Ljapgolly_scalajs_react_extra_router_RouteCmd = (function(p, m) {
  var x = $m_Ljapgolly_scalajs_react_extra_router_Redirect$Push$();
  if ((x === m)) {
    var base = this.baseUrl$1;
    return new $c_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState().init___Ljapgolly_scalajs_react_extra_router_AbsUrl(base.apply__Ljapgolly_scalajs_react_extra_router_Path__Ljapgolly_scalajs_react_extra_router_AbsUrl(p))
  } else {
    var x$3 = $m_Ljapgolly_scalajs_react_extra_router_Redirect$Replace$();
    if ((x$3 === m)) {
      var base$1 = this.baseUrl$1;
      return new $c_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState().init___Ljapgolly_scalajs_react_extra_router_AbsUrl(base$1.apply__Ljapgolly_scalajs_react_extra_router_Path__Ljapgolly_scalajs_react_extra_router_AbsUrl(p))
    } else {
      throw new $c_s_MatchError().init___O(m)
    }
  }
});
$c_Ljapgolly_scalajs_react_extra_router_RouterLogic.prototype.syncToPath__Ljapgolly_scalajs_react_extra_router_Path__Ljapgolly_scalajs_react_extra_router_RouteCmd = (function(path) {
  var parsed = $as_s_util_Either(this.cfg$1.parse$1.apply__O__O(path));
  if ($is_s_util_Right(parsed)) {
    var x2 = $as_s_util_Right(parsed);
    var page = x2.value$2;
    var action = $as_Ljapgolly_scalajs_react_extra_router_Action(this.cfg$1.action$1.apply__O__O__O(path, page));
    var msg = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, path$1, page$1, action$1) {
      return (function() {
        return new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["Action for page ", " at ", " is ", "."])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([page$1, path$1, action$1]))
      })
    })(this, path, page, action));
    var cmd = new $c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log().init___F0(msg).$$greater$greater__Ljapgolly_scalajs_react_extra_router_RouteCmd__Ljapgolly_scalajs_react_extra_router_RouteCmd(this.resolve__O__Ljapgolly_scalajs_react_extra_router_Action__Ljapgolly_scalajs_react_extra_router_RouteCmd(page, action))
  } else {
    if ((!$is_s_util_Left(parsed))) {
      throw new $c_s_MatchError().init___O(parsed)
    };
    var x3 = $as_s_util_Left(parsed);
    var r = $as_Ljapgolly_scalajs_react_extra_router_Redirect(x3.value$2);
    var cmd = this.redirect__Ljapgolly_scalajs_react_extra_router_Redirect__Ljapgolly_scalajs_react_extra_router_RouteCmd(r)
  };
  var msg$1 = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2, path$2, parsed$1) {
    return (function() {
      return new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["Parsed ", " to ", "."])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([path$2, parsed$1]))
    })
  })(this, path, parsed));
  return new $c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log().init___F0(msg$1).$$greater$greater__Ljapgolly_scalajs_react_extra_router_RouteCmd__Ljapgolly_scalajs_react_extra_router_RouteCmd(cmd)
});
$c_Ljapgolly_scalajs_react_extra_router_RouterLogic.prototype.redirect__Ljapgolly_scalajs_react_extra_router_Redirect__Ljapgolly_scalajs_react_extra_router_RouteCmd = (function(r) {
  if ($is_Ljapgolly_scalajs_react_extra_router_RedirectToPage(r)) {
    var x2 = $as_Ljapgolly_scalajs_react_extra_router_RedirectToPage(r);
    var page = x2.page$1;
    var m = x2.method$1;
    return this.redirectToPath__Ljapgolly_scalajs_react_extra_router_Path__Ljapgolly_scalajs_react_extra_router_Redirect$Method__Ljapgolly_scalajs_react_extra_router_RouteCmd($as_Ljapgolly_scalajs_react_extra_router_Path(this.cfg$1.path$1.apply__O__O(page)), m)
  } else if ($is_Ljapgolly_scalajs_react_extra_router_RedirectToPath(r)) {
    var x3 = $as_Ljapgolly_scalajs_react_extra_router_RedirectToPath(r);
    var path = x3.path$1;
    var m$2 = x3.method$1;
    return this.redirectToPath__Ljapgolly_scalajs_react_extra_router_Path__Ljapgolly_scalajs_react_extra_router_Redirect$Method__Ljapgolly_scalajs_react_extra_router_RouteCmd(path, m$2)
  } else {
    throw new $c_s_MatchError().init___O(r)
  }
});
$c_Ljapgolly_scalajs_react_extra_router_RouterLogic.prototype.resolveAction__Ljapgolly_scalajs_react_extra_router_Action__s_util_Either = (function(a) {
  if ($is_Ljapgolly_scalajs_react_extra_router_Renderer(a)) {
    var x2 = $as_Ljapgolly_scalajs_react_extra_router_Renderer(a);
    $m_s_package$();
    return new $c_s_util_Right().init___O(x2)
  } else if ($is_Ljapgolly_scalajs_react_extra_router_Redirect(a)) {
    var x3 = $as_Ljapgolly_scalajs_react_extra_router_Redirect(a);
    $m_s_package$();
    var value = this.redirect__Ljapgolly_scalajs_react_extra_router_Redirect__Ljapgolly_scalajs_react_extra_router_RouteCmd(x3);
    return new $c_s_util_Left().init___O(value)
  } else {
    throw new $c_s_MatchError().init___O(a)
  }
});
$c_Ljapgolly_scalajs_react_extra_router_RouterLogic.prototype.resolve__O__Ljapgolly_scalajs_react_extra_router_Action__Ljapgolly_scalajs_react_extra_router_RouteCmd = (function(page, action) {
  var this$1 = this.resolveAction__Ljapgolly_scalajs_react_extra_router_Action__s_util_Either(action);
  if ($is_s_util_Right(this$1)) {
    var x2 = $as_s_util_Right(this$1);
    var b = x2.value$2;
    var r = $as_Ljapgolly_scalajs_react_extra_router_Renderer(b);
    var jsx$1 = new $c_s_util_Right().init___O(new $c_Ljapgolly_scalajs_react_extra_router_Resolution().init___O__F0(page, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, r$1) {
      return (function() {
        var ctl = $this.ctl$1;
        return $as_Ljapgolly_scalajs_react_vdom_VdomElement(r$1.f$1.apply__O__O(ctl))
      })
    })(this, r))))
  } else {
    if ((!$is_s_util_Left(this$1))) {
      throw new $c_s_MatchError().init___O(this$1)
    };
    var jsx$1 = this$1
  };
  return this.cmdOrPure__p1__s_util_Either__Ljapgolly_scalajs_react_extra_router_RouteCmd(jsx$1)
});
var $d_Ljapgolly_scalajs_react_extra_router_RouterLogic = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_RouterLogic: 0
}, false, "japgolly.scalajs.react.extra.router.RouterLogic", {
  Ljapgolly_scalajs_react_extra_router_RouterLogic: 1,
  O: 1,
  Ljapgolly_scalajs_react_extra_Broadcaster: 1,
  Ljapgolly_scalajs_react_extra_Listenable: 1
});
$c_Ljapgolly_scalajs_react_extra_router_RouterLogic.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_RouterLogic;
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule$.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule$.prototype = $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule$.prototype;
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule$.prototype.parseOnly__F1__Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule = (function(parse) {
  return new $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule().init___F1__F1__F2(parse, new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$30$2) {
      return $m_s_None$()
    })
  })(this)), new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function(this$2) {
    return (function(x$31$2, x$32$2) {
      $as_Ljapgolly_scalajs_react_extra_router_Path(x$31$2);
      return $m_s_None$()
    })
  })(this)))
});
var $d_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule$: 0
}, false, "japgolly.scalajs.react.extra.router.StaticDsl$Rule$", {
  Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule$.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule$;
var $n_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule$ = (void 0);
function $m_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule$() {
  if ((!$n_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule$)) {
    $n_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule$ = new $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule$().init___()
  };
  return $n_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_internal_Semigroup$() {
  $c_O.call(this);
  this.callback$1 = null;
  this.eitherCB$1 = null
}
$c_Ljapgolly_scalajs_react_internal_Semigroup$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_internal_Semigroup$.prototype.constructor = $c_Ljapgolly_scalajs_react_internal_Semigroup$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_internal_Semigroup$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_internal_Semigroup$.prototype = $c_Ljapgolly_scalajs_react_internal_Semigroup$.prototype;
$c_Ljapgolly_scalajs_react_internal_Semigroup$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_internal_Semigroup$ = this;
  this.callback$1 = new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function($this) {
    return (function(x$1$2, x$2$2) {
      var x$1 = $as_Ljapgolly_scalajs_react_CallbackTo(x$1$2).japgolly$scalajs$react$CallbackTo$$f$1;
      var x$2 = $as_F0(x$2$2);
      return new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0($m_Ljapgolly_scalajs_react_CallbackTo$().$$greater$greater$extension__F0__F0__F0(x$1, $as_Ljapgolly_scalajs_react_CallbackTo(x$2.apply__O()).japgolly$scalajs$react$CallbackTo$$f$1))
    })
  })(this));
  this.eitherCB$1 = new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function(this$2) {
    return (function(x$3$2, x$4$2) {
      var x$3 = $as_Ljapgolly_scalajs_react_CallbackTo(x$3$2).japgolly$scalajs$react$CallbackTo$$f$1;
      var x$4 = $as_F0(x$4$2);
      var this$1 = $m_Ljapgolly_scalajs_react_CallbackTo$();
      var b = $as_Ljapgolly_scalajs_react_CallbackTo(x$4.apply__O()).japgolly$scalajs$react$CallbackTo$$f$1;
      var this$3 = $m_Ljapgolly_scalajs_react_CallbackTo$();
      var op = new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function($this$1) {
        return (function(x$11$2, x$12$2) {
          var x$11 = $as_F0(x$11$2);
          var x$12 = $as_F0(x$12$2);
          return ($uZ(x$11.apply__O()) || $uZ(x$12.apply__O()))
        })
      })(this$1));
      var x = new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0(x$3);
      var x$5 = x.japgolly$scalajs$react$CallbackTo$$f$1;
      var f = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this$2, x$6, y, op$1) {
        return (function() {
          return $uZ(op$1.apply__O__O__O(x$6, y))
        })
      })(this$3, x$5, b, op));
      return new $c_Ljapgolly_scalajs_react_CallbackTo().init___F0(f)
    })
  })(this));
  return this
});
var $d_Ljapgolly_scalajs_react_internal_Semigroup$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_internal_Semigroup$: 0
}, false, "japgolly.scalajs.react.internal.Semigroup$", {
  Ljapgolly_scalajs_react_internal_Semigroup$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_internal_Semigroup$.prototype.$classData = $d_Ljapgolly_scalajs_react_internal_Semigroup$;
var $n_Ljapgolly_scalajs_react_internal_Semigroup$ = (void 0);
function $m_Ljapgolly_scalajs_react_internal_Semigroup$() {
  if ((!$n_Ljapgolly_scalajs_react_internal_Semigroup$)) {
    $n_Ljapgolly_scalajs_react_internal_Semigroup$ = new $c_Ljapgolly_scalajs_react_internal_Semigroup$().init___()
  };
  return $n_Ljapgolly_scalajs_react_internal_Semigroup$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_Attr$Event() {
  $c_Ljapgolly_scalajs_react_vdom_Attr$Generic.call(this)
}
$c_Ljapgolly_scalajs_react_vdom_Attr$Event.prototype = new $h_Ljapgolly_scalajs_react_vdom_Attr$Generic();
$c_Ljapgolly_scalajs_react_vdom_Attr$Event.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Attr$Event;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_Attr$Event() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_Attr$Event.prototype = $c_Ljapgolly_scalajs_react_vdom_Attr$Event.prototype;
$c_Ljapgolly_scalajs_react_vdom_Attr$Event.prototype.init___T = (function(name) {
  $c_Ljapgolly_scalajs_react_vdom_Attr.prototype.init___T.call(this, name);
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_Attr$Event = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Attr$Event: 0
}, false, "japgolly.scalajs.react.vdom.Attr$Event", {
  Ljapgolly_scalajs_react_vdom_Attr$Event: 1,
  Ljapgolly_scalajs_react_vdom_Attr$Generic: 1,
  Ljapgolly_scalajs_react_vdom_Attr: 1,
  O: 1
});
$c_Ljapgolly_scalajs_react_vdom_Attr$Event.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Attr$Event;
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_HtmlTagOf$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_vdom_HtmlTagOf$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_HtmlTagOf$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_HtmlTagOf$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_HtmlTagOf$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_HtmlTagOf$.prototype = $c_Ljapgolly_scalajs_react_vdom_HtmlTagOf$.prototype;
$c_Ljapgolly_scalajs_react_vdom_HtmlTagOf$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_vdom_HtmlTagOf$.prototype.apply$extension__T__sc_Seq__Ljapgolly_scalajs_react_vdom_TagOf = (function($$this, xs) {
  var this$1 = $m_sci_Nil$();
  return new $c_Ljapgolly_scalajs_react_vdom_TagOf().init___T__sci_List__T($$this, new $c_sci_$colon$colon().init___O__sci_List(xs, this$1), $m_Ljapgolly_scalajs_react_vdom_Namespace$().Html$1)
});
var $d_Ljapgolly_scalajs_react_vdom_HtmlTagOf$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_HtmlTagOf$: 0
}, false, "japgolly.scalajs.react.vdom.HtmlTagOf$", {
  Ljapgolly_scalajs_react_vdom_HtmlTagOf$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlTagOf$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_HtmlTagOf$;
var $n_Ljapgolly_scalajs_react_vdom_HtmlTagOf$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_HtmlTagOf$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_HtmlTagOf$)) {
    $n_Ljapgolly_scalajs_react_vdom_HtmlTagOf$ = new $c_Ljapgolly_scalajs_react_vdom_HtmlTagOf$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_HtmlTagOf$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_Namespace$() {
  $c_O.call(this);
  this.Html$1 = null;
  this.Svg$1 = null
}
$c_Ljapgolly_scalajs_react_vdom_Namespace$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_Namespace$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_Namespace$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_Namespace$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_Namespace$.prototype = $c_Ljapgolly_scalajs_react_vdom_Namespace$.prototype;
$c_Ljapgolly_scalajs_react_vdom_Namespace$.prototype.init___ = (function() {
  this.Html$1 = "http://www.w3.org/1999/xhtml";
  this.Svg$1 = "http://www.w3.org/2000/svg";
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_Namespace$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_Namespace$: 0
}, false, "japgolly.scalajs.react.vdom.Namespace$", {
  Ljapgolly_scalajs_react_vdom_Namespace$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_vdom_Namespace$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_Namespace$;
var $n_Ljapgolly_scalajs_react_vdom_Namespace$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_Namespace$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_Namespace$)) {
    $n_Ljapgolly_scalajs_react_vdom_Namespace$ = new $c_Ljapgolly_scalajs_react_vdom_Namespace$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_Namespace$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_SvgTagOf$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_vdom_SvgTagOf$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_SvgTagOf$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_SvgTagOf$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_SvgTagOf$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_SvgTagOf$.prototype = $c_Ljapgolly_scalajs_react_vdom_SvgTagOf$.prototype;
$c_Ljapgolly_scalajs_react_vdom_SvgTagOf$.prototype.init___ = (function() {
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_SvgTagOf$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_SvgTagOf$: 0
}, false, "japgolly.scalajs.react.vdom.SvgTagOf$", {
  Ljapgolly_scalajs_react_vdom_SvgTagOf$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_vdom_SvgTagOf$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_SvgTagOf$;
var $n_Ljapgolly_scalajs_react_vdom_SvgTagOf$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_SvgTagOf$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_SvgTagOf$)) {
    $n_Ljapgolly_scalajs_react_vdom_SvgTagOf$ = new $c_Ljapgolly_scalajs_react_vdom_SvgTagOf$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_SvgTagOf$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_VdomElement() {
  $c_Ljapgolly_scalajs_react_vdom_VdomNode.call(this);
  this.rawElement$2 = null
}
$c_Ljapgolly_scalajs_react_vdom_VdomElement.prototype = new $h_Ljapgolly_scalajs_react_vdom_VdomNode();
$c_Ljapgolly_scalajs_react_vdom_VdomElement.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_VdomElement;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_VdomElement() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_VdomElement.prototype = $c_Ljapgolly_scalajs_react_vdom_VdomElement.prototype;
$c_Ljapgolly_scalajs_react_vdom_VdomElement.prototype.init___Ljapgolly_scalajs_react_raw_package$ReactElement = (function(rawElement) {
  this.rawElement$2 = rawElement;
  $c_Ljapgolly_scalajs_react_vdom_VdomNode.prototype.init___sjs_js_$bar.call(this, rawElement);
  return this
});
function $is_Ljapgolly_scalajs_react_vdom_VdomElement(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_vdom_VdomElement)))
}
function $as_Ljapgolly_scalajs_react_vdom_VdomElement(obj) {
  return (($is_Ljapgolly_scalajs_react_vdom_VdomElement(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.vdom.VdomElement"))
}
function $isArrayOf_Ljapgolly_scalajs_react_vdom_VdomElement(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_vdom_VdomElement)))
}
function $asArrayOf_Ljapgolly_scalajs_react_vdom_VdomElement(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_vdom_VdomElement(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.vdom.VdomElement;", depth))
}
var $d_Ljapgolly_scalajs_react_vdom_VdomElement = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_VdomElement: 0
}, false, "japgolly.scalajs.react.vdom.VdomElement", {
  Ljapgolly_scalajs_react_vdom_VdomElement: 1,
  Ljapgolly_scalajs_react_vdom_VdomNode: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_TagMod: 1
});
$c_Ljapgolly_scalajs_react_vdom_VdomElement.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_VdomElement;
var $d_jl_Boolean = new $TypeData().initClass({
  jl_Boolean: 0
}, false, "java.lang.Boolean", {
  jl_Boolean: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return ((typeof x) === "boolean")
}));
/** @constructor */
function $c_jl_Character() {
  $c_O.call(this);
  this.value$1 = 0
}
$c_jl_Character.prototype = new $h_O();
$c_jl_Character.prototype.constructor = $c_jl_Character;
/** @constructor */
function $h_jl_Character() {
  /*<skip>*/
}
$h_jl_Character.prototype = $c_jl_Character.prototype;
$c_jl_Character.prototype.equals__O__Z = (function(that) {
  if ($is_jl_Character(that)) {
    var jsx$1 = this.value$1;
    var this$1 = $as_jl_Character(that);
    return (jsx$1 === this$1.value$1)
  } else {
    return false
  }
});
$c_jl_Character.prototype.toString__T = (function() {
  var c = this.value$1;
  return $as_T($g.String.fromCharCode(c))
});
$c_jl_Character.prototype.init___C = (function(value) {
  this.value$1 = value;
  return this
});
$c_jl_Character.prototype.hashCode__I = (function() {
  return this.value$1
});
function $is_jl_Character(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Character)))
}
function $as_jl_Character(obj) {
  return (($is_jl_Character(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.Character"))
}
function $isArrayOf_jl_Character(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Character)))
}
function $asArrayOf_jl_Character(obj, depth) {
  return (($isArrayOf_jl_Character(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Character;", depth))
}
var $d_jl_Character = new $TypeData().initClass({
  jl_Character: 0
}, false, "java.lang.Character", {
  jl_Character: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
});
$c_jl_Character.prototype.$classData = $d_jl_Character;
/** @constructor */
function $c_jl_Character$() {
  $c_O.call(this);
  this.java$lang$Character$$charTypesFirst256$1 = null;
  this.charTypeIndices$1 = null;
  this.charTypes$1 = null;
  this.isMirroredIndices$1 = null;
  this.bitmap$0$1 = 0
}
$c_jl_Character$.prototype = new $h_O();
$c_jl_Character$.prototype.constructor = $c_jl_Character$;
/** @constructor */
function $h_jl_Character$() {
  /*<skip>*/
}
$h_jl_Character$.prototype = $c_jl_Character$.prototype;
$c_jl_Character$.prototype.init___ = (function() {
  return this
});
$c_jl_Character$.prototype.digit__C__I__I = (function(c, radix) {
  return (((radix > 36) || (radix < 2)) ? (-1) : ((((c >= 48) && (c <= 57)) && ((((-48) + c) | 0) < radix)) ? (((-48) + c) | 0) : ((((c >= 65) && (c <= 90)) && ((((-65) + c) | 0) < (((-10) + radix) | 0))) ? (((-55) + c) | 0) : ((((c >= 97) && (c <= 122)) && ((((-97) + c) | 0) < (((-10) + radix) | 0))) ? (((-87) + c) | 0) : ((((c >= 65313) && (c <= 65338)) && ((((-65313) + c) | 0) < (((-10) + radix) | 0))) ? (((-65303) + c) | 0) : ((((c >= 65345) && (c <= 65370)) && ((((-65345) + c) | 0) < (((-10) + radix) | 0))) ? (((-65303) + c) | 0) : (-1)))))))
});
var $d_jl_Character$ = new $TypeData().initClass({
  jl_Character$: 0
}, false, "java.lang.Character$", {
  jl_Character$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_jl_Character$.prototype.$classData = $d_jl_Character$;
var $n_jl_Character$ = (void 0);
function $m_jl_Character$() {
  if ((!$n_jl_Character$)) {
    $n_jl_Character$ = new $c_jl_Character$().init___()
  };
  return $n_jl_Character$
}
/** @constructor */
function $c_jl_Double$() {
  $c_O.call(this);
  this.doubleStrPat$1 = null;
  this.bitmap$0$1 = false
}
$c_jl_Double$.prototype = new $h_O();
$c_jl_Double$.prototype.constructor = $c_jl_Double$;
/** @constructor */
function $h_jl_Double$() {
  /*<skip>*/
}
$h_jl_Double$.prototype = $c_jl_Double$.prototype;
$c_jl_Double$.prototype.init___ = (function() {
  return this
});
$c_jl_Double$.prototype.compare__D__D__I = (function(a, b) {
  if ((a !== a)) {
    return ((b !== b) ? 0 : 1)
  } else if ((b !== b)) {
    return (-1)
  } else if ((a === b)) {
    if ((a === 0.0)) {
      var ainf = (1.0 / a);
      return ((ainf === (1.0 / b)) ? 0 : ((ainf < 0) ? (-1) : 1))
    } else {
      return 0
    }
  } else {
    return ((a < b) ? (-1) : 1)
  }
});
var $d_jl_Double$ = new $TypeData().initClass({
  jl_Double$: 0
}, false, "java.lang.Double$", {
  jl_Double$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_jl_Double$.prototype.$classData = $d_jl_Double$;
var $n_jl_Double$ = (void 0);
function $m_jl_Double$() {
  if ((!$n_jl_Double$)) {
    $n_jl_Double$ = new $c_jl_Double$().init___()
  };
  return $n_jl_Double$
}
/** @constructor */
function $c_jl_Error() {
  $c_jl_Throwable.call(this)
}
$c_jl_Error.prototype = new $h_jl_Throwable();
$c_jl_Error.prototype.constructor = $c_jl_Error;
/** @constructor */
function $h_jl_Error() {
  /*<skip>*/
}
$h_jl_Error.prototype = $c_jl_Error.prototype;
/** @constructor */
function $c_jl_Exception() {
  $c_jl_Throwable.call(this)
}
$c_jl_Exception.prototype = new $h_jl_Throwable();
$c_jl_Exception.prototype.constructor = $c_jl_Exception;
/** @constructor */
function $h_jl_Exception() {
  /*<skip>*/
}
$h_jl_Exception.prototype = $c_jl_Exception.prototype;
/** @constructor */
function $c_jl_Integer$() {
  $c_O.call(this)
}
$c_jl_Integer$.prototype = new $h_O();
$c_jl_Integer$.prototype.constructor = $c_jl_Integer$;
/** @constructor */
function $h_jl_Integer$() {
  /*<skip>*/
}
$h_jl_Integer$.prototype = $c_jl_Integer$.prototype;
$c_jl_Integer$.prototype.init___ = (function() {
  return this
});
$c_jl_Integer$.prototype.fail$1__p1__T__sr_Nothing$ = (function(s$1) {
  throw new $c_jl_NumberFormatException().init___T(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["For input string: \"", "\""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([s$1])))
});
$c_jl_Integer$.prototype.parseInt__T__I__I = (function(s, radix) {
  if ((s === null)) {
    var jsx$1 = true
  } else {
    var this$2 = new $c_sci_StringOps().init___T(s);
    var $$this = this$2.repr$1;
    var jsx$1 = ($uI($$this.length) === 0)
  };
  if (((jsx$1 || (radix < 2)) || (radix > 36))) {
    this.fail$1__p1__T__sr_Nothing$(s)
  } else {
    var i = ((((65535 & $uI(s.charCodeAt(0))) === 45) || ((65535 & $uI(s.charCodeAt(0))) === 43)) ? 1 : 0);
    var this$12 = new $c_sci_StringOps().init___T(s);
    var $$this$1 = this$12.repr$1;
    if (($uI($$this$1.length) <= i)) {
      this.fail$1__p1__T__sr_Nothing$(s)
    } else {
      while (true) {
        var jsx$2 = i;
        var this$16 = new $c_sci_StringOps().init___T(s);
        var $$this$2 = this$16.repr$1;
        if ((jsx$2 < $uI($$this$2.length))) {
          var jsx$3 = $m_jl_Character$();
          var index = i;
          if ((jsx$3.digit__C__I__I((65535 & $uI(s.charCodeAt(index))), radix) < 0)) {
            this.fail$1__p1__T__sr_Nothing$(s)
          };
          i = ((1 + i) | 0)
        } else {
          break
        }
      };
      var res = $uD($g.parseInt(s, radix));
      return (((res !== res) || ((res > 2147483647) || (res < (-2147483648)))) ? this.fail$1__p1__T__sr_Nothing$(s) : $doubleToInt(res))
    }
  }
});
$c_jl_Integer$.prototype.bitCount__I__I = (function(i) {
  var t1 = ((i - (1431655765 & (i >> 1))) | 0);
  var t2 = (((858993459 & t1) + (858993459 & (t1 >> 2))) | 0);
  return ($imul(16843009, (252645135 & ((t2 + (t2 >> 4)) | 0))) >> 24)
});
var $d_jl_Integer$ = new $TypeData().initClass({
  jl_Integer$: 0
}, false, "java.lang.Integer$", {
  jl_Integer$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_jl_Integer$.prototype.$classData = $d_jl_Integer$;
var $n_jl_Integer$ = (void 0);
function $m_jl_Integer$() {
  if ((!$n_jl_Integer$)) {
    $n_jl_Integer$ = new $c_jl_Integer$().init___()
  };
  return $n_jl_Integer$
}
/** @constructor */
function $c_jl_Long$() {
  $c_O.call(this);
  this.StringRadixInfos$1 = null;
  this.bitmap$0$1 = false
}
$c_jl_Long$.prototype = new $h_O();
$c_jl_Long$.prototype.constructor = $c_jl_Long$;
/** @constructor */
function $h_jl_Long$() {
  /*<skip>*/
}
$h_jl_Long$.prototype = $c_jl_Long$.prototype;
$c_jl_Long$.prototype.init___ = (function() {
  return this
});
$c_jl_Long$.prototype.StringRadixInfos__p1__sjs_js_Array = (function() {
  return ((!this.bitmap$0$1) ? this.StringRadixInfos$lzycompute__p1__sjs_js_Array() : this.StringRadixInfos$1)
});
$c_jl_Long$.prototype.parseLong__T__I__J = (function(s, radix) {
  if ((s === "")) {
    this.parseLongError__p1__T__sr_Nothing$(s)
  };
  var start = 0;
  var neg = false;
  var x1 = (65535 & $uI(s.charCodeAt(0)));
  switch (x1) {
    case 43: {
      start = 1;
      break
    }
    case 45: {
      start = 1;
      neg = true;
      break
    }
  };
  var t = this.parseUnsignedLongInternal__T__I__I__J(s, radix, start);
  var lo = t.lo$2;
  var hi = t.hi$2;
  if (neg) {
    var lo$1 = ((-lo) | 0);
    var hi$1 = ((lo !== 0) ? (~hi) : ((-hi) | 0));
    if (((hi$1 === 0) ? (lo$1 !== 0) : (hi$1 > 0))) {
      this.parseLongError__p1__T__sr_Nothing$(s)
    };
    return new $c_sjsr_RuntimeLong().init___I__I(lo$1, hi$1)
  } else {
    if ((hi < 0)) {
      this.parseLongError__p1__T__sr_Nothing$(s)
    };
    return new $c_sjsr_RuntimeLong().init___I__I(lo, hi)
  }
});
$c_jl_Long$.prototype.parseLongError__p1__T__sr_Nothing$ = (function(s) {
  throw new $c_jl_NumberFormatException().init___T(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["For input string: \"", "\""])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([s])))
});
$c_jl_Long$.prototype.parseUnsignedLongInternal__T__I__I__J = (function(s, radix, start) {
  var length = $uI(s.length);
  if ((((start >= length) || (radix < 2)) || (radix > 36))) {
    this.parseLongError__p1__T__sr_Nothing$(s)
  } else {
    var radixInfo = $as_jl_Long$StringRadixInfo(this.StringRadixInfos__p1__sjs_js_Array()[radix]);
    var chunkLen = radixInfo.chunkLength$1;
    var firstChunkStart = start;
    while (true) {
      if ((firstChunkStart < length)) {
        var index = firstChunkStart;
        var jsx$1 = ((65535 & $uI(s.charCodeAt(index))) === 48)
      } else {
        var jsx$1 = false
      };
      if (jsx$1) {
        firstChunkStart = ((1 + firstChunkStart) | 0)
      } else {
        break
      }
    };
    if ((((length - firstChunkStart) | 0) > $imul(3, chunkLen))) {
      this.parseLongError__p1__T__sr_Nothing$(s)
    };
    var i = firstChunkStart;
    while ((i < length)) {
      var jsx$2 = $m_jl_Character$();
      var index$1 = i;
      if ((jsx$2.digit__C__I__I((65535 & $uI(s.charCodeAt(index$1))), radix) < 0)) {
        this.parseLongError__p1__T__sr_Nothing$(s)
      };
      i = ((1 + i) | 0)
    };
    var firstChunkLength = ((1 + (((((-1) + ((length - firstChunkStart) | 0)) | 0) % chunkLen) | 0)) | 0);
    var firstChunkEnd = ((firstChunkStart + firstChunkLength) | 0);
    var chunkStart = firstChunkStart;
    var chunk = $as_T(s.substring(chunkStart, firstChunkEnd));
    var chunkValueDouble = $uD($g.parseInt(chunk, radix));
    var x = $doubleToInt(chunkValueDouble);
    if ((firstChunkEnd === length)) {
      return new $c_sjsr_RuntimeLong().init___I__I(x, 0)
    } else {
      var t = radixInfo.radixPowLength$1;
      var lo = t.lo$2;
      var hi$1 = t.hi$2;
      var secondChunkEnd = ((firstChunkEnd + chunkLen) | 0);
      var a0 = (65535 & x);
      var a1 = ((x >>> 16) | 0);
      var b0 = (65535 & lo);
      var b1 = ((lo >>> 16) | 0);
      var a0b0 = $imul(a0, b0);
      var a1b0 = $imul(a1, b0);
      var a0b1 = $imul(a0, b1);
      var lo$1 = ((a0b0 + (((a1b0 + a0b1) | 0) << 16)) | 0);
      var c1part = ((((a0b0 >>> 16) | 0) + a0b1) | 0);
      var hi$2 = (((((($imul(x, hi$1) + $imul(a1, b1)) | 0) + ((c1part >>> 16) | 0)) | 0) + (((((65535 & c1part) + a1b0) | 0) >>> 16) | 0)) | 0);
      var chunk$1 = $as_T(s.substring(firstChunkEnd, secondChunkEnd));
      var chunkValueDouble$1 = $uD($g.parseInt(chunk$1, radix));
      var x$1 = $doubleToInt(chunkValueDouble$1);
      var lo$2 = ((lo$1 + x$1) | 0);
      var hi$4 = ((((-2147483648) ^ lo$2) < ((-2147483648) ^ lo$1)) ? ((1 + hi$2) | 0) : hi$2);
      if ((secondChunkEnd === length)) {
        return new $c_sjsr_RuntimeLong().init___I__I(lo$2, hi$4)
      } else {
        $m_s_Predef$().assert__Z__V((((secondChunkEnd + chunkLen) | 0) === length));
        var t$1 = radixInfo.overflowBarrier$1;
        var lo$3 = t$1.lo$2;
        var hi$5 = t$1.hi$2;
        var chunk$2 = $as_T(s.substring(secondChunkEnd, length));
        var chunkValueDouble$2 = $uD($g.parseInt(chunk$2, radix));
        var x$2 = $doubleToInt(chunkValueDouble$2);
        if (((hi$4 === hi$5) ? (((-2147483648) ^ lo$2) > ((-2147483648) ^ lo$3)) : (hi$4 > hi$5))) {
          this.parseLongError__p1__T__sr_Nothing$(s)
        };
        var a0$1 = (65535 & lo$2);
        var a1$1 = ((lo$2 >>> 16) | 0);
        var b0$1 = (65535 & lo);
        var b1$1 = ((lo >>> 16) | 0);
        var a0b0$1 = $imul(a0$1, b0$1);
        var a1b0$1 = $imul(a1$1, b0$1);
        var a0b1$1 = $imul(a0$1, b1$1);
        var lo$4 = ((a0b0$1 + (((a1b0$1 + a0b1$1) | 0) << 16)) | 0);
        var c1part$1 = ((((a0b0$1 >>> 16) | 0) + a0b1$1) | 0);
        var hi$7 = (((((((($imul(lo$2, hi$1) + $imul(hi$4, lo)) | 0) + $imul(a1$1, b1$1)) | 0) + ((c1part$1 >>> 16) | 0)) | 0) + (((((65535 & c1part$1) + a1b0$1) | 0) >>> 16) | 0)) | 0);
        var lo$5 = ((lo$4 + x$2) | 0);
        var hi$8 = ((((-2147483648) ^ lo$5) < ((-2147483648) ^ lo$4)) ? ((1 + hi$7) | 0) : hi$7);
        var hi$9 = ((-2147483648) ^ hi$8);
        if (((hi$9 === (-2147483648)) && (((-2147483648) ^ lo$5) < ((-2147483648) ^ x$2)))) {
          this.parseLongError__p1__T__sr_Nothing$(s)
        };
        return new $c_sjsr_RuntimeLong().init___I__I(lo$5, hi$8)
      }
    }
  }
});
$c_jl_Long$.prototype.StringRadixInfos$lzycompute__p1__sjs_js_Array = (function() {
  if ((!this.bitmap$0$1)) {
    var r = [];
    var i = 0;
    while (true) {
      var arg1 = i;
      r.push(null);
      if ((i === 1)) {
        break
      };
      i = ((1 + i) | 0)
    };
    var i$1 = 2;
    while (true) {
      var arg1$1 = i$1;
      var barrier = ((2147483647 / arg1$1) | 0);
      var radixPowLength = arg1$1;
      var chunkLength = 1;
      var paddingZeros = "0";
      while ((radixPowLength <= barrier)) {
        radixPowLength = $imul(radixPowLength, arg1$1);
        chunkLength = ((1 + chunkLength) | 0);
        paddingZeros = (paddingZeros + "0")
      };
      var value = radixPowLength;
      var hi = (value >> 31);
      var this$8 = $m_sjsr_RuntimeLong$();
      var lo = this$8.divideUnsignedImpl__I__I__I__I__I((-1), (-1), value, hi);
      var hi$1 = this$8.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
      var elem = new $c_jl_Long$StringRadixInfo().init___I__J__T__J(chunkLength, new $c_sjsr_RuntimeLong().init___I__I(value, hi), paddingZeros, new $c_sjsr_RuntimeLong().init___I__I(lo, hi$1));
      r.push(elem);
      if ((i$1 === 36)) {
        break
      };
      i$1 = ((1 + i$1) | 0)
    };
    this.StringRadixInfos$1 = r;
    this.bitmap$0$1 = true
  };
  return this.StringRadixInfos$1
});
var $d_jl_Long$ = new $TypeData().initClass({
  jl_Long$: 0
}, false, "java.lang.Long$", {
  jl_Long$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_jl_Long$.prototype.$classData = $d_jl_Long$;
var $n_jl_Long$ = (void 0);
function $m_jl_Long$() {
  if ((!$n_jl_Long$)) {
    $n_jl_Long$ = new $c_jl_Long$().init___()
  };
  return $n_jl_Long$
}
/** @constructor */
function $c_ju_UUID() {
  $c_O.call(this);
  this.i1$1 = 0;
  this.i2$1 = 0;
  this.i3$1 = 0;
  this.i4$1 = 0;
  this.l1$1 = null;
  this.l2$1 = null
}
$c_ju_UUID.prototype = new $h_O();
$c_ju_UUID.prototype.constructor = $c_ju_UUID;
/** @constructor */
function $h_ju_UUID() {
  /*<skip>*/
}
$h_ju_UUID.prototype = $c_ju_UUID.prototype;
$c_ju_UUID.prototype.equals__O__Z = (function(that) {
  if ($is_ju_UUID(that)) {
    var x2 = $as_ju_UUID(that);
    return ((((this.i1$1 === x2.i1$1) && (this.i2$1 === x2.i2$1)) && (this.i3$1 === x2.i3$1)) && (this.i4$1 === x2.i4$1))
  } else {
    return false
  }
});
$c_ju_UUID.prototype.toString__T = (function() {
  var i = this.i1$1;
  var x = $uD((i >>> 0));
  var jsx$10 = x.toString(16);
  var s = $as_T(jsx$10);
  var beginIndex = $uI(s.length);
  var jsx$11 = $as_T("00000000".substring(beginIndex));
  var i$1 = ((this.i2$1 >>> 16) | 0);
  var x$1 = $uD((i$1 >>> 0));
  var jsx$8 = x$1.toString(16);
  var s$1 = $as_T(jsx$8);
  var beginIndex$1 = $uI(s$1.length);
  var jsx$9 = $as_T("0000".substring(beginIndex$1));
  var i$2 = (65535 & this.i2$1);
  var x$2 = $uD((i$2 >>> 0));
  var jsx$6 = x$2.toString(16);
  var s$2 = $as_T(jsx$6);
  var beginIndex$2 = $uI(s$2.length);
  var jsx$7 = $as_T("0000".substring(beginIndex$2));
  var i$3 = ((this.i3$1 >>> 16) | 0);
  var x$3 = $uD((i$3 >>> 0));
  var jsx$4 = x$3.toString(16);
  var s$3 = $as_T(jsx$4);
  var beginIndex$3 = $uI(s$3.length);
  var jsx$5 = $as_T("0000".substring(beginIndex$3));
  var i$4 = (65535 & this.i3$1);
  var x$4 = $uD((i$4 >>> 0));
  var jsx$2 = x$4.toString(16);
  var s$4 = $as_T(jsx$2);
  var beginIndex$4 = $uI(s$4.length);
  var jsx$3 = $as_T("0000".substring(beginIndex$4));
  var i$5 = this.i4$1;
  var x$5 = $uD((i$5 >>> 0));
  var jsx$1 = x$5.toString(16);
  var s$5 = $as_T(jsx$1);
  var beginIndex$5 = $uI(s$5.length);
  return ((((((((((("" + jsx$11) + s) + "-") + (("" + jsx$9) + s$1)) + "-") + (("" + jsx$7) + s$2)) + "-") + (("" + jsx$5) + s$3)) + "-") + (("" + jsx$3) + s$4)) + (("" + $as_T("00000000".substring(beginIndex$5))) + s$5))
});
$c_ju_UUID.prototype.init___I__I__I__I__jl_Long__jl_Long = (function(i1, i2, i3, i4, l1, l2) {
  this.i1$1 = i1;
  this.i2$1 = i2;
  this.i3$1 = i3;
  this.i4$1 = i4;
  this.l1$1 = l1;
  this.l2$1 = l2;
  return this
});
$c_ju_UUID.prototype.hashCode__I = (function() {
  return (((this.i1$1 ^ this.i2$1) ^ this.i3$1) ^ this.i4$1)
});
function $is_ju_UUID(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.ju_UUID)))
}
function $as_ju_UUID(obj) {
  return (($is_ju_UUID(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.util.UUID"))
}
function $isArrayOf_ju_UUID(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.ju_UUID)))
}
function $asArrayOf_ju_UUID(obj, depth) {
  return (($isArrayOf_ju_UUID(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.util.UUID;", depth))
}
var $d_ju_UUID = new $TypeData().initClass({
  ju_UUID: 0
}, false, "java.util.UUID", {
  ju_UUID: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
});
$c_ju_UUID.prototype.$classData = $d_ju_UUID;
/** @constructor */
function $c_ju_UUID$() {
  $c_O.call(this);
  this.rng$1 = null;
  this.bitmap$0$1 = false
}
$c_ju_UUID$.prototype = new $h_O();
$c_ju_UUID$.prototype.constructor = $c_ju_UUID$;
/** @constructor */
function $h_ju_UUID$() {
  /*<skip>*/
}
$h_ju_UUID$.prototype = $c_ju_UUID$.prototype;
$c_ju_UUID$.prototype.init___ = (function() {
  return this
});
$c_ju_UUID$.prototype.fail$1__p1__T__sr_Nothing$ = (function(name$1) {
  throw new $c_jl_IllegalArgumentException().init___T(("Invalid UUID string: " + name$1))
});
$c_ju_UUID$.prototype.fromString__T__ju_UUID = (function(name) {
  if (((((($uI(name.length) !== 36) || ((65535 & $uI(name.charCodeAt(8))) !== 45)) || ((65535 & $uI(name.charCodeAt(13))) !== 45)) || ((65535 & $uI(name.charCodeAt(18))) !== 45)) || ((65535 & $uI(name.charCodeAt(23))) !== 45))) {
    this.fail$1__p1__T__sr_Nothing$(name)
  };
  try {
    var his = $as_T(name.substring(0, 4));
    var los = $as_T(name.substring(4, 8));
    var i1 = (($m_jl_Integer$().parseInt__T__I__I(his, 16) << 16) | $m_jl_Integer$().parseInt__T__I__I(los, 16));
    var his$1 = $as_T(name.substring(9, 13));
    var los$1 = $as_T(name.substring(14, 18));
    var i2 = (($m_jl_Integer$().parseInt__T__I__I(his$1, 16) << 16) | $m_jl_Integer$().parseInt__T__I__I(los$1, 16));
    var his$2 = $as_T(name.substring(19, 23));
    var los$2 = $as_T(name.substring(24, 28));
    var i3 = (($m_jl_Integer$().parseInt__T__I__I(his$2, 16) << 16) | $m_jl_Integer$().parseInt__T__I__I(los$2, 16));
    var his$3 = $as_T(name.substring(28, 32));
    var los$3 = $as_T(name.substring(32, 36));
    var i4 = (($m_jl_Integer$().parseInt__T__I__I(his$3, 16) << 16) | $m_jl_Integer$().parseInt__T__I__I(los$3, 16));
    return new $c_ju_UUID().init___I__I__I__I__jl_Long__jl_Long(i1, i2, i3, i4, null, null)
  } catch (e) {
    if ($is_jl_NumberFormatException(e)) {
      this.fail$1__p1__T__sr_Nothing$(name)
    } else {
      throw e
    }
  }
});
var $d_ju_UUID$ = new $TypeData().initClass({
  ju_UUID$: 0
}, false, "java.util.UUID$", {
  ju_UUID$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_ju_UUID$.prototype.$classData = $d_ju_UUID$;
var $n_ju_UUID$ = (void 0);
function $m_ju_UUID$() {
  if ((!$n_ju_UUID$)) {
    $n_ju_UUID$ = new $c_ju_UUID$().init___()
  };
  return $n_ju_UUID$
}
/** @constructor */
function $c_ju_regex_Pattern() {
  $c_O.call(this);
  this.jsRegExp$1 = null;
  this.$$undpattern$1 = null;
  this.$$undflags$1 = 0
}
$c_ju_regex_Pattern.prototype = new $h_O();
$c_ju_regex_Pattern.prototype.constructor = $c_ju_regex_Pattern;
/** @constructor */
function $h_ju_regex_Pattern() {
  /*<skip>*/
}
$h_ju_regex_Pattern.prototype = $c_ju_regex_Pattern.prototype;
$c_ju_regex_Pattern.prototype.init___sjs_js_RegExp__T__I = (function(jsRegExp, _pattern, _flags) {
  this.jsRegExp$1 = jsRegExp;
  this.$$undpattern$1 = _pattern;
  this.$$undflags$1 = _flags;
  return this
});
$c_ju_regex_Pattern.prototype.toString__T = (function() {
  return this.$$undpattern$1
});
$c_ju_regex_Pattern.prototype.newJSRegExp__sjs_js_RegExp = (function() {
  var r = new $g.RegExp(this.jsRegExp$1);
  if ((r !== this.jsRegExp$1)) {
    return r
  } else {
    var jsFlags = ((($uZ(this.jsRegExp$1.global) ? "g" : "") + ($uZ(this.jsRegExp$1.ignoreCase) ? "i" : "")) + ($uZ(this.jsRegExp$1.multiline) ? "m" : ""));
    return new $g.RegExp($as_T(this.jsRegExp$1.source), jsFlags)
  }
});
var $d_ju_regex_Pattern = new $TypeData().initClass({
  ju_regex_Pattern: 0
}, false, "java.util.regex.Pattern", {
  ju_regex_Pattern: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_ju_regex_Pattern.prototype.$classData = $d_ju_regex_Pattern;
/** @constructor */
function $c_ju_regex_Pattern$() {
  $c_O.call(this);
  this.java$util$regex$Pattern$$splitHackPat$1 = null;
  this.java$util$regex$Pattern$$flagHackPat$1 = null
}
$c_ju_regex_Pattern$.prototype = new $h_O();
$c_ju_regex_Pattern$.prototype.constructor = $c_ju_regex_Pattern$;
/** @constructor */
function $h_ju_regex_Pattern$() {
  /*<skip>*/
}
$h_ju_regex_Pattern$.prototype = $c_ju_regex_Pattern$.prototype;
$c_ju_regex_Pattern$.prototype.init___ = (function() {
  $n_ju_regex_Pattern$ = this;
  this.java$util$regex$Pattern$$splitHackPat$1 = new $g.RegExp("^\\\\Q(.|\\n|\\r)\\\\E$");
  this.java$util$regex$Pattern$$flagHackPat$1 = new $g.RegExp("^\\(\\?([idmsuxU]*)(?:-([idmsuxU]*))?\\)");
  return this
});
$c_ju_regex_Pattern$.prototype.matches__T__jl_CharSequence__Z = (function(regex, input) {
  var this$1 = this.compile__T__I__ju_regex_Pattern(regex, 0);
  return new $c_ju_regex_Matcher().init___ju_regex_Pattern__jl_CharSequence__I__I(this$1, input, 0, $charSequenceLength(input)).matches__Z()
});
$c_ju_regex_Pattern$.prototype.compile__T__I__ju_regex_Pattern = (function(regex, flags) {
  if (((16 & flags) !== 0)) {
    var x1 = new $c_T2().init___O__O(this.quote__T__T(regex), flags)
  } else {
    var m = this.java$util$regex$Pattern$$splitHackPat$1.exec(regex);
    if ((m !== null)) {
      var value = m[1];
      if ((value === (void 0))) {
        throw new $c_ju_NoSuchElementException().init___T("undefined.get")
      };
      var this$5 = new $c_s_Some().init___O(new $c_T2().init___O__O(this.quote__T__T($as_T(value)), flags))
    } else {
      var this$5 = $m_s_None$()
    };
    if (this$5.isEmpty__Z()) {
      var m$1 = this.java$util$regex$Pattern$$flagHackPat$1.exec(regex);
      if ((m$1 !== null)) {
        var value$1 = m$1[0];
        if ((value$1 === (void 0))) {
          throw new $c_ju_NoSuchElementException().init___T("undefined.get")
        };
        var thiz = $as_T(value$1);
        var beginIndex = $uI(thiz.length);
        var newPat = $as_T(regex.substring(beginIndex));
        var value$2 = m$1[1];
        if ((value$2 === (void 0))) {
          var flags1 = flags
        } else {
          var chars = $as_T(value$2);
          var this$19 = new $c_sci_StringOps().init___T(chars);
          var start = 0;
          var $$this = this$19.repr$1;
          var end = $uI($$this.length);
          var z = flags;
          var start$1 = start;
          var z$1 = z;
          var jsx$1;
          _foldl: while (true) {
            if ((start$1 !== end)) {
              var temp$start = ((1 + start$1) | 0);
              var arg1 = z$1;
              var arg2 = this$19.apply__I__O(start$1);
              var f = $uI(arg1);
              if ((arg2 === null)) {
                var c = 0
              } else {
                var this$23 = $as_jl_Character(arg2);
                var c = this$23.value$1
              };
              var temp$z = (f | this.java$util$regex$Pattern$$charToFlag__C__I(c));
              start$1 = temp$start;
              z$1 = temp$z;
              continue _foldl
            };
            var jsx$1 = z$1;
            break
          };
          var flags1 = $uI(jsx$1)
        };
        var value$3 = m$1[2];
        if ((value$3 === (void 0))) {
          var flags2 = flags1
        } else {
          var chars$3 = $as_T(value$3);
          var this$30 = new $c_sci_StringOps().init___T(chars$3);
          var start$2 = 0;
          var $$this$1 = this$30.repr$1;
          var end$1 = $uI($$this$1.length);
          var z$2 = flags1;
          var start$3 = start$2;
          var z$3 = z$2;
          var jsx$2;
          _foldl$1: while (true) {
            if ((start$3 !== end$1)) {
              var temp$start$1 = ((1 + start$3) | 0);
              var arg1$1 = z$3;
              var arg2$1 = this$30.apply__I__O(start$3);
              var f$1 = $uI(arg1$1);
              if ((arg2$1 === null)) {
                var c$1 = 0
              } else {
                var this$34 = $as_jl_Character(arg2$1);
                var c$1 = this$34.value$1
              };
              var temp$z$1 = (f$1 & (~this.java$util$regex$Pattern$$charToFlag__C__I(c$1)));
              start$3 = temp$start$1;
              z$3 = temp$z$1;
              continue _foldl$1
            };
            var jsx$2 = z$3;
            break
          };
          var flags2 = $uI(jsx$2)
        };
        var this$35 = new $c_s_Some().init___O(new $c_T2().init___O__O(newPat, flags2))
      } else {
        var this$35 = $m_s_None$()
      }
    } else {
      var this$35 = this$5
    };
    var x1 = $as_T2((this$35.isEmpty__Z() ? new $c_T2().init___O__O(regex, flags) : this$35.get__O()))
  };
  if ((x1 === null)) {
    throw new $c_s_MatchError().init___O(x1)
  };
  var jsPattern = $as_T(x1.$$und1$f);
  var flags1$1 = $uI(x1.$$und2$f);
  var jsFlags = (("g" + (((2 & flags1$1) !== 0) ? "i" : "")) + (((8 & flags1$1) !== 0) ? "m" : ""));
  var jsRegExp = new $g.RegExp(jsPattern, jsFlags);
  return new $c_ju_regex_Pattern().init___sjs_js_RegExp__T__I(jsRegExp, regex, flags1$1)
});
$c_ju_regex_Pattern$.prototype.quote__T__T = (function(s) {
  var result = "";
  var i = 0;
  while ((i < $uI(s.length))) {
    var index = i;
    var c = (65535 & $uI(s.charCodeAt(index)));
    var jsx$2 = result;
    switch (c) {
      case 92:
      case 46:
      case 40:
      case 41:
      case 91:
      case 93:
      case 123:
      case 125:
      case 124:
      case 63:
      case 42:
      case 43:
      case 94:
      case 36: {
        var jsx$1 = ("\\" + new $c_jl_Character().init___C(c));
        break
      }
      default: {
        var jsx$1 = new $c_jl_Character().init___C(c)
      }
    };
    result = (("" + jsx$2) + jsx$1);
    i = ((1 + i) | 0)
  };
  return result
});
$c_ju_regex_Pattern$.prototype.java$util$regex$Pattern$$charToFlag__C__I = (function(c) {
  switch (c) {
    case 105: {
      return 2;
      break
    }
    case 100: {
      return 1;
      break
    }
    case 109: {
      return 8;
      break
    }
    case 115: {
      return 32;
      break
    }
    case 117: {
      return 64;
      break
    }
    case 120: {
      return 4;
      break
    }
    case 85: {
      return 256;
      break
    }
    default: {
      $m_s_sys_package$().error__T__sr_Nothing$("bad in-pattern flag")
    }
  }
});
var $d_ju_regex_Pattern$ = new $TypeData().initClass({
  ju_regex_Pattern$: 0
}, false, "java.util.regex.Pattern$", {
  ju_regex_Pattern$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_ju_regex_Pattern$.prototype.$classData = $d_ju_regex_Pattern$;
var $n_ju_regex_Pattern$ = (void 0);
function $m_ju_regex_Pattern$() {
  if ((!$n_ju_regex_Pattern$)) {
    $n_ju_regex_Pattern$ = new $c_ju_regex_Pattern$().init___()
  };
  return $n_ju_regex_Pattern$
}
/** @constructor */
function $c_s_Option$() {
  $c_O.call(this)
}
$c_s_Option$.prototype = new $h_O();
$c_s_Option$.prototype.constructor = $c_s_Option$;
/** @constructor */
function $h_s_Option$() {
  /*<skip>*/
}
$h_s_Option$.prototype = $c_s_Option$.prototype;
$c_s_Option$.prototype.init___ = (function() {
  return this
});
$c_s_Option$.prototype.apply__O__s_Option = (function(x) {
  return ((x === null) ? $m_s_None$() : new $c_s_Some().init___O(x))
});
var $d_s_Option$ = new $TypeData().initClass({
  s_Option$: 0
}, false, "scala.Option$", {
  s_Option$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Option$.prototype.$classData = $d_s_Option$;
var $n_s_Option$ = (void 0);
function $m_s_Option$() {
  if ((!$n_s_Option$)) {
    $n_s_Option$ = new $c_s_Option$().init___()
  };
  return $n_s_Option$
}
/** @constructor */
function $c_s_Predef$() {
  $c_s_LowPriorityImplicits.call(this);
  this.Map$2 = null;
  this.Set$2 = null;
  this.ClassManifest$2 = null;
  this.Manifest$2 = null;
  this.NoManifest$2 = null;
  this.StringCanBuildFrom$2 = null;
  this.singleton$und$less$colon$less$2 = null;
  this.scala$Predef$$singleton$und$eq$colon$eq$f = null
}
$c_s_Predef$.prototype = new $h_s_LowPriorityImplicits();
$c_s_Predef$.prototype.constructor = $c_s_Predef$;
/** @constructor */
function $h_s_Predef$() {
  /*<skip>*/
}
$h_s_Predef$.prototype = $c_s_Predef$.prototype;
$c_s_Predef$.prototype.assert__Z__V = (function(assertion) {
  if ((!assertion)) {
    throw new $c_jl_AssertionError().init___O("assertion failed")
  }
});
$c_s_Predef$.prototype.init___ = (function() {
  $n_s_Predef$ = this;
  $m_s_package$();
  $m_sci_List$();
  this.Map$2 = $m_sci_Map$();
  this.Set$2 = $m_sci_Set$();
  this.ClassManifest$2 = $m_s_reflect_package$().ClassManifest$1;
  this.Manifest$2 = $m_s_reflect_package$().Manifest$1;
  this.NoManifest$2 = $m_s_reflect_NoManifest$();
  this.StringCanBuildFrom$2 = new $c_s_Predef$$anon$3().init___();
  this.singleton$und$less$colon$less$2 = new $c_s_Predef$$anon$1().init___();
  this.scala$Predef$$singleton$und$eq$colon$eq$f = new $c_s_Predef$$anon$2().init___();
  return this
});
$c_s_Predef$.prototype.require__Z__V = (function(requirement) {
  if ((!requirement)) {
    throw new $c_jl_IllegalArgumentException().init___T("requirement failed")
  }
});
var $d_s_Predef$ = new $TypeData().initClass({
  s_Predef$: 0
}, false, "scala.Predef$", {
  s_Predef$: 1,
  s_LowPriorityImplicits: 1,
  O: 1,
  s_DeprecatedPredef: 1
});
$c_s_Predef$.prototype.$classData = $d_s_Predef$;
var $n_s_Predef$ = (void 0);
function $m_s_Predef$() {
  if ((!$n_s_Predef$)) {
    $n_s_Predef$ = new $c_s_Predef$().init___()
  };
  return $n_s_Predef$
}
/** @constructor */
function $c_s_StringContext$() {
  $c_O.call(this)
}
$c_s_StringContext$.prototype = new $h_O();
$c_s_StringContext$.prototype.constructor = $c_s_StringContext$;
/** @constructor */
function $h_s_StringContext$() {
  /*<skip>*/
}
$h_s_StringContext$.prototype = $c_s_StringContext$.prototype;
$c_s_StringContext$.prototype.init___ = (function() {
  return this
});
$c_s_StringContext$.prototype.treatEscapes0__p1__T__Z__T = (function(str, strict) {
  var len = $uI(str.length);
  var x1 = $m_sjsr_RuntimeString$().indexOf__T__I__I(str, 92);
  switch (x1) {
    case (-1): {
      return str;
      break
    }
    default: {
      return this.replace$1__p1__I__T__Z__I__T(x1, str, strict, len)
    }
  }
});
$c_s_StringContext$.prototype.loop$1__p1__I__I__T__Z__I__jl_StringBuilder__T = (function(i, next, str$1, strict$1, len$1, b$1) {
  _loop: while (true) {
    if ((next >= 0)) {
      if ((next > i)) {
        b$1.append__jl_CharSequence__I__I__jl_StringBuilder(str$1, i, next)
      };
      var idx = ((1 + next) | 0);
      if ((idx >= len$1)) {
        throw new $c_s_StringContext$InvalidEscapeException().init___T__I(str$1, next)
      };
      var index = idx;
      var x1 = (65535 & $uI(str$1.charCodeAt(index)));
      switch (x1) {
        case 98: {
          var c = 8;
          break
        }
        case 116: {
          var c = 9;
          break
        }
        case 110: {
          var c = 10;
          break
        }
        case 102: {
          var c = 12;
          break
        }
        case 114: {
          var c = 13;
          break
        }
        case 34: {
          var c = 34;
          break
        }
        case 39: {
          var c = 39;
          break
        }
        case 92: {
          var c = 92;
          break
        }
        default: {
          if (((x1 >= 48) && (x1 <= 55))) {
            if (strict$1) {
              throw new $c_s_StringContext$InvalidEscapeException().init___T__I(str$1, next)
            };
            var index$1 = idx;
            var leadch = (65535 & $uI(str$1.charCodeAt(index$1)));
            var oct = (((-48) + leadch) | 0);
            idx = ((1 + idx) | 0);
            if ((idx < len$1)) {
              var index$2 = idx;
              var jsx$2 = ((65535 & $uI(str$1.charCodeAt(index$2))) >= 48)
            } else {
              var jsx$2 = false
            };
            if (jsx$2) {
              var index$3 = idx;
              var jsx$1 = ((65535 & $uI(str$1.charCodeAt(index$3))) <= 55)
            } else {
              var jsx$1 = false
            };
            if (jsx$1) {
              var jsx$3 = oct;
              var index$4 = idx;
              oct = (((-48) + (((jsx$3 << 3) + (65535 & $uI(str$1.charCodeAt(index$4)))) | 0)) | 0);
              idx = ((1 + idx) | 0);
              if (((idx < len$1) && (leadch <= 51))) {
                var index$5 = idx;
                var jsx$5 = ((65535 & $uI(str$1.charCodeAt(index$5))) >= 48)
              } else {
                var jsx$5 = false
              };
              if (jsx$5) {
                var index$6 = idx;
                var jsx$4 = ((65535 & $uI(str$1.charCodeAt(index$6))) <= 55)
              } else {
                var jsx$4 = false
              };
              if (jsx$4) {
                var jsx$6 = oct;
                var index$7 = idx;
                oct = (((-48) + (((jsx$6 << 3) + (65535 & $uI(str$1.charCodeAt(index$7)))) | 0)) | 0);
                idx = ((1 + idx) | 0)
              }
            };
            idx = (((-1) + idx) | 0);
            var c = (65535 & oct)
          } else {
            var c;
            throw new $c_s_StringContext$InvalidEscapeException().init___T__I(str$1, next)
          }
        }
      };
      idx = ((1 + idx) | 0);
      b$1.append__C__jl_StringBuilder(c);
      var temp$i = idx;
      var temp$next = $m_sjsr_RuntimeString$().indexOf__T__I__I__I(str$1, 92, idx);
      i = temp$i;
      next = temp$next;
      continue _loop
    } else {
      if ((i < len$1)) {
        b$1.append__jl_CharSequence__I__I__jl_StringBuilder(str$1, i, len$1)
      };
      return b$1.content$1
    }
  }
});
$c_s_StringContext$.prototype.replace$1__p1__I__T__Z__I__T = (function(first, str$1, strict$1, len$1) {
  var b = new $c_jl_StringBuilder().init___();
  return this.loop$1__p1__I__I__T__Z__I__jl_StringBuilder__T(0, first, str$1, strict$1, len$1, b)
});
var $d_s_StringContext$ = new $TypeData().initClass({
  s_StringContext$: 0
}, false, "scala.StringContext$", {
  s_StringContext$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_StringContext$.prototype.$classData = $d_s_StringContext$;
var $n_s_StringContext$ = (void 0);
function $m_s_StringContext$() {
  if ((!$n_s_StringContext$)) {
    $n_s_StringContext$ = new $c_s_StringContext$().init___()
  };
  return $n_s_StringContext$
}
/** @constructor */
function $c_s_math_Fractional$() {
  $c_O.call(this)
}
$c_s_math_Fractional$.prototype = new $h_O();
$c_s_math_Fractional$.prototype.constructor = $c_s_math_Fractional$;
/** @constructor */
function $h_s_math_Fractional$() {
  /*<skip>*/
}
$h_s_math_Fractional$.prototype = $c_s_math_Fractional$.prototype;
$c_s_math_Fractional$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Fractional$ = new $TypeData().initClass({
  s_math_Fractional$: 0
}, false, "scala.math.Fractional$", {
  s_math_Fractional$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Fractional$.prototype.$classData = $d_s_math_Fractional$;
var $n_s_math_Fractional$ = (void 0);
function $m_s_math_Fractional$() {
  if ((!$n_s_math_Fractional$)) {
    $n_s_math_Fractional$ = new $c_s_math_Fractional$().init___()
  };
  return $n_s_math_Fractional$
}
/** @constructor */
function $c_s_math_Integral$() {
  $c_O.call(this)
}
$c_s_math_Integral$.prototype = new $h_O();
$c_s_math_Integral$.prototype.constructor = $c_s_math_Integral$;
/** @constructor */
function $h_s_math_Integral$() {
  /*<skip>*/
}
$h_s_math_Integral$.prototype = $c_s_math_Integral$.prototype;
$c_s_math_Integral$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Integral$ = new $TypeData().initClass({
  s_math_Integral$: 0
}, false, "scala.math.Integral$", {
  s_math_Integral$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Integral$.prototype.$classData = $d_s_math_Integral$;
var $n_s_math_Integral$ = (void 0);
function $m_s_math_Integral$() {
  if ((!$n_s_math_Integral$)) {
    $n_s_math_Integral$ = new $c_s_math_Integral$().init___()
  };
  return $n_s_math_Integral$
}
/** @constructor */
function $c_s_math_Numeric$() {
  $c_O.call(this)
}
$c_s_math_Numeric$.prototype = new $h_O();
$c_s_math_Numeric$.prototype.constructor = $c_s_math_Numeric$;
/** @constructor */
function $h_s_math_Numeric$() {
  /*<skip>*/
}
$h_s_math_Numeric$.prototype = $c_s_math_Numeric$.prototype;
$c_s_math_Numeric$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Numeric$ = new $TypeData().initClass({
  s_math_Numeric$: 0
}, false, "scala.math.Numeric$", {
  s_math_Numeric$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Numeric$.prototype.$classData = $d_s_math_Numeric$;
var $n_s_math_Numeric$ = (void 0);
function $m_s_math_Numeric$() {
  if ((!$n_s_math_Numeric$)) {
    $n_s_math_Numeric$ = new $c_s_math_Numeric$().init___()
  };
  return $n_s_math_Numeric$
}
function $is_s_math_ScalaNumber(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_math_ScalaNumber)))
}
function $as_s_math_ScalaNumber(obj) {
  return (($is_s_math_ScalaNumber(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.math.ScalaNumber"))
}
function $isArrayOf_s_math_ScalaNumber(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_math_ScalaNumber)))
}
function $asArrayOf_s_math_ScalaNumber(obj, depth) {
  return (($isArrayOf_s_math_ScalaNumber(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.math.ScalaNumber;", depth))
}
/** @constructor */
function $c_s_util_Either$() {
  $c_O.call(this)
}
$c_s_util_Either$.prototype = new $h_O();
$c_s_util_Either$.prototype.constructor = $c_s_util_Either$;
/** @constructor */
function $h_s_util_Either$() {
  /*<skip>*/
}
$h_s_util_Either$.prototype = $c_s_util_Either$.prototype;
$c_s_util_Either$.prototype.init___ = (function() {
  return this
});
var $d_s_util_Either$ = new $TypeData().initClass({
  s_util_Either$: 0
}, false, "scala.util.Either$", {
  s_util_Either$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Either$.prototype.$classData = $d_s_util_Either$;
var $n_s_util_Either$ = (void 0);
function $m_s_util_Either$() {
  if ((!$n_s_util_Either$)) {
    $n_s_util_Either$ = new $c_s_util_Either$().init___()
  };
  return $n_s_util_Either$
}
/** @constructor */
function $c_s_util_Left$() {
  $c_O.call(this)
}
$c_s_util_Left$.prototype = new $h_O();
$c_s_util_Left$.prototype.constructor = $c_s_util_Left$;
/** @constructor */
function $h_s_util_Left$() {
  /*<skip>*/
}
$h_s_util_Left$.prototype = $c_s_util_Left$.prototype;
$c_s_util_Left$.prototype.init___ = (function() {
  return this
});
$c_s_util_Left$.prototype.toString__T = (function() {
  return "Left"
});
var $d_s_util_Left$ = new $TypeData().initClass({
  s_util_Left$: 0
}, false, "scala.util.Left$", {
  s_util_Left$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Left$.prototype.$classData = $d_s_util_Left$;
var $n_s_util_Left$ = (void 0);
function $m_s_util_Left$() {
  if ((!$n_s_util_Left$)) {
    $n_s_util_Left$ = new $c_s_util_Left$().init___()
  };
  return $n_s_util_Left$
}
/** @constructor */
function $c_s_util_Right$() {
  $c_O.call(this)
}
$c_s_util_Right$.prototype = new $h_O();
$c_s_util_Right$.prototype.constructor = $c_s_util_Right$;
/** @constructor */
function $h_s_util_Right$() {
  /*<skip>*/
}
$h_s_util_Right$.prototype = $c_s_util_Right$.prototype;
$c_s_util_Right$.prototype.init___ = (function() {
  return this
});
$c_s_util_Right$.prototype.toString__T = (function() {
  return "Right"
});
var $d_s_util_Right$ = new $TypeData().initClass({
  s_util_Right$: 0
}, false, "scala.util.Right$", {
  s_util_Right$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Right$.prototype.$classData = $d_s_util_Right$;
var $n_s_util_Right$ = (void 0);
function $m_s_util_Right$() {
  if ((!$n_s_util_Right$)) {
    $n_s_util_Right$ = new $c_s_util_Right$().init___()
  };
  return $n_s_util_Right$
}
/** @constructor */
function $c_s_util_control_NoStackTrace$() {
  $c_O.call(this);
  this.$$undnoSuppression$1 = false
}
$c_s_util_control_NoStackTrace$.prototype = new $h_O();
$c_s_util_control_NoStackTrace$.prototype.constructor = $c_s_util_control_NoStackTrace$;
/** @constructor */
function $h_s_util_control_NoStackTrace$() {
  /*<skip>*/
}
$h_s_util_control_NoStackTrace$.prototype = $c_s_util_control_NoStackTrace$.prototype;
$c_s_util_control_NoStackTrace$.prototype.init___ = (function() {
  this.$$undnoSuppression$1 = false;
  return this
});
var $d_s_util_control_NoStackTrace$ = new $TypeData().initClass({
  s_util_control_NoStackTrace$: 0
}, false, "scala.util.control.NoStackTrace$", {
  s_util_control_NoStackTrace$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_control_NoStackTrace$.prototype.$classData = $d_s_util_control_NoStackTrace$;
var $n_s_util_control_NoStackTrace$ = (void 0);
function $m_s_util_control_NoStackTrace$() {
  if ((!$n_s_util_control_NoStackTrace$)) {
    $n_s_util_control_NoStackTrace$ = new $c_s_util_control_NoStackTrace$().init___()
  };
  return $n_s_util_control_NoStackTrace$
}
/** @constructor */
function $c_s_util_matching_Regex() {
  $c_O.call(this);
  this.pattern$1 = null;
  this.scala$util$matching$Regex$$groupNames$f = null
}
$c_s_util_matching_Regex.prototype = new $h_O();
$c_s_util_matching_Regex.prototype.constructor = $c_s_util_matching_Regex;
/** @constructor */
function $h_s_util_matching_Regex() {
  /*<skip>*/
}
$h_s_util_matching_Regex.prototype = $c_s_util_matching_Regex.prototype;
$c_s_util_matching_Regex.prototype.init___T__sc_Seq = (function(regex, groupNames) {
  var this$1 = $m_ju_regex_Pattern$();
  $c_s_util_matching_Regex.prototype.init___ju_regex_Pattern__sc_Seq.call(this, this$1.compile__T__I__ju_regex_Pattern(regex, 0), groupNames);
  return this
});
$c_s_util_matching_Regex.prototype.init___ju_regex_Pattern__sc_Seq = (function(pattern, groupNames) {
  this.pattern$1 = pattern;
  this.scala$util$matching$Regex$$groupNames$f = groupNames;
  return this
});
$c_s_util_matching_Regex.prototype.toString__T = (function() {
  return this.pattern$1.$$undpattern$1
});
$c_s_util_matching_Regex.prototype.replaceAllIn__jl_CharSequence__T__T = (function(target, replacement) {
  var this$1 = this.pattern$1;
  var m = new $c_ju_regex_Matcher().init___ju_regex_Pattern__jl_CharSequence__I__I(this$1, target, 0, $charSequenceLength(target));
  return m.replaceAll__T__T(replacement)
});
var $d_s_util_matching_Regex = new $TypeData().initClass({
  s_util_matching_Regex: 0
}, false, "scala.util.matching.Regex", {
  s_util_matching_Regex: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_matching_Regex.prototype.$classData = $d_s_util_matching_Regex;
/** @constructor */
function $c_sc_IndexedSeq$$anon$1() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.call(this)
}
$c_sc_IndexedSeq$$anon$1.prototype = new $h_scg_GenTraversableFactory$GenericCanBuildFrom();
$c_sc_IndexedSeq$$anon$1.prototype.constructor = $c_sc_IndexedSeq$$anon$1;
/** @constructor */
function $h_sc_IndexedSeq$$anon$1() {
  /*<skip>*/
}
$h_sc_IndexedSeq$$anon$1.prototype = $c_sc_IndexedSeq$$anon$1.prototype;
$c_sc_IndexedSeq$$anon$1.prototype.apply__scm_Builder = (function() {
  $m_sc_IndexedSeq$();
  $m_sci_IndexedSeq$();
  $m_sci_Vector$();
  return new $c_sci_VectorBuilder().init___()
});
$c_sc_IndexedSeq$$anon$1.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory.call(this, $m_sc_IndexedSeq$());
  return this
});
var $d_sc_IndexedSeq$$anon$1 = new $TypeData().initClass({
  sc_IndexedSeq$$anon$1: 0
}, false, "scala.collection.IndexedSeq$$anon$1", {
  sc_IndexedSeq$$anon$1: 1,
  scg_GenTraversableFactory$GenericCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_sc_IndexedSeq$$anon$1.prototype.$classData = $d_sc_IndexedSeq$$anon$1;
/** @constructor */
function $c_scg_GenSeqFactory() {
  $c_scg_GenTraversableFactory.call(this)
}
$c_scg_GenSeqFactory.prototype = new $h_scg_GenTraversableFactory();
$c_scg_GenSeqFactory.prototype.constructor = $c_scg_GenSeqFactory;
/** @constructor */
function $h_scg_GenSeqFactory() {
  /*<skip>*/
}
$h_scg_GenSeqFactory.prototype = $c_scg_GenSeqFactory.prototype;
/** @constructor */
function $c_scg_GenTraversableFactory$$anon$1() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.call(this);
  this.$$outer$2 = null
}
$c_scg_GenTraversableFactory$$anon$1.prototype = new $h_scg_GenTraversableFactory$GenericCanBuildFrom();
$c_scg_GenTraversableFactory$$anon$1.prototype.constructor = $c_scg_GenTraversableFactory$$anon$1;
/** @constructor */
function $h_scg_GenTraversableFactory$$anon$1() {
  /*<skip>*/
}
$h_scg_GenTraversableFactory$$anon$1.prototype = $c_scg_GenTraversableFactory$$anon$1.prototype;
$c_scg_GenTraversableFactory$$anon$1.prototype.apply__scm_Builder = (function() {
  return this.$$outer$2.newBuilder__scm_Builder()
});
$c_scg_GenTraversableFactory$$anon$1.prototype.init___scg_GenTraversableFactory = (function($$outer) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory.call(this, $$outer);
  return this
});
var $d_scg_GenTraversableFactory$$anon$1 = new $TypeData().initClass({
  scg_GenTraversableFactory$$anon$1: 0
}, false, "scala.collection.generic.GenTraversableFactory$$anon$1", {
  scg_GenTraversableFactory$$anon$1: 1,
  scg_GenTraversableFactory$GenericCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_scg_GenTraversableFactory$$anon$1.prototype.$classData = $d_scg_GenTraversableFactory$$anon$1;
/** @constructor */
function $c_scg_ImmutableMapFactory() {
  $c_scg_MapFactory.call(this)
}
$c_scg_ImmutableMapFactory.prototype = new $h_scg_MapFactory();
$c_scg_ImmutableMapFactory.prototype.constructor = $c_scg_ImmutableMapFactory;
/** @constructor */
function $h_scg_ImmutableMapFactory() {
  /*<skip>*/
}
$h_scg_ImmutableMapFactory.prototype = $c_scg_ImmutableMapFactory.prototype;
/** @constructor */
function $c_sci_$colon$colon$() {
  $c_O.call(this)
}
$c_sci_$colon$colon$.prototype = new $h_O();
$c_sci_$colon$colon$.prototype.constructor = $c_sci_$colon$colon$;
/** @constructor */
function $h_sci_$colon$colon$() {
  /*<skip>*/
}
$h_sci_$colon$colon$.prototype = $c_sci_$colon$colon$.prototype;
$c_sci_$colon$colon$.prototype.init___ = (function() {
  return this
});
$c_sci_$colon$colon$.prototype.toString__T = (function() {
  return "::"
});
var $d_sci_$colon$colon$ = new $TypeData().initClass({
  sci_$colon$colon$: 0
}, false, "scala.collection.immutable.$colon$colon$", {
  sci_$colon$colon$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_$colon$colon$.prototype.$classData = $d_sci_$colon$colon$;
var $n_sci_$colon$colon$ = (void 0);
function $m_sci_$colon$colon$() {
  if ((!$n_sci_$colon$colon$)) {
    $n_sci_$colon$colon$ = new $c_sci_$colon$colon$().init___()
  };
  return $n_sci_$colon$colon$
}
/** @constructor */
function $c_sci_Range$() {
  $c_O.call(this);
  this.MAX$undPRINT$1 = 0
}
$c_sci_Range$.prototype = new $h_O();
$c_sci_Range$.prototype.constructor = $c_sci_Range$;
/** @constructor */
function $h_sci_Range$() {
  /*<skip>*/
}
$h_sci_Range$.prototype = $c_sci_Range$.prototype;
$c_sci_Range$.prototype.init___ = (function() {
  this.MAX$undPRINT$1 = 512;
  return this
});
var $d_sci_Range$ = new $TypeData().initClass({
  sci_Range$: 0
}, false, "scala.collection.immutable.Range$", {
  sci_Range$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Range$.prototype.$classData = $d_sci_Range$;
var $n_sci_Range$ = (void 0);
function $m_sci_Range$() {
  if ((!$n_sci_Range$)) {
    $n_sci_Range$ = new $c_sci_Range$().init___()
  };
  return $n_sci_Range$
}
/** @constructor */
function $c_sci_Stream$StreamCanBuildFrom() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.call(this)
}
$c_sci_Stream$StreamCanBuildFrom.prototype = new $h_scg_GenTraversableFactory$GenericCanBuildFrom();
$c_sci_Stream$StreamCanBuildFrom.prototype.constructor = $c_sci_Stream$StreamCanBuildFrom;
/** @constructor */
function $h_sci_Stream$StreamCanBuildFrom() {
  /*<skip>*/
}
$h_sci_Stream$StreamCanBuildFrom.prototype = $c_sci_Stream$StreamCanBuildFrom.prototype;
$c_sci_Stream$StreamCanBuildFrom.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory.call(this, $m_sci_Stream$());
  return this
});
var $d_sci_Stream$StreamCanBuildFrom = new $TypeData().initClass({
  sci_Stream$StreamCanBuildFrom: 0
}, false, "scala.collection.immutable.Stream$StreamCanBuildFrom", {
  sci_Stream$StreamCanBuildFrom: 1,
  scg_GenTraversableFactory$GenericCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
$c_sci_Stream$StreamCanBuildFrom.prototype.$classData = $d_sci_Stream$StreamCanBuildFrom;
/** @constructor */
function $c_scm_StringBuilder$() {
  $c_O.call(this)
}
$c_scm_StringBuilder$.prototype = new $h_O();
$c_scm_StringBuilder$.prototype.constructor = $c_scm_StringBuilder$;
/** @constructor */
function $h_scm_StringBuilder$() {
  /*<skip>*/
}
$h_scm_StringBuilder$.prototype = $c_scm_StringBuilder$.prototype;
$c_scm_StringBuilder$.prototype.init___ = (function() {
  return this
});
var $d_scm_StringBuilder$ = new $TypeData().initClass({
  scm_StringBuilder$: 0
}, false, "scala.collection.mutable.StringBuilder$", {
  scm_StringBuilder$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_StringBuilder$.prototype.$classData = $d_scm_StringBuilder$;
var $n_scm_StringBuilder$ = (void 0);
function $m_scm_StringBuilder$() {
  if ((!$n_scm_StringBuilder$)) {
    $n_scm_StringBuilder$ = new $c_scm_StringBuilder$().init___()
  };
  return $n_scm_StringBuilder$
}
/** @constructor */
function $c_sjsr_AnonFunction0() {
  $c_sr_AbstractFunction0.call(this);
  this.f$2 = null
}
$c_sjsr_AnonFunction0.prototype = new $h_sr_AbstractFunction0();
$c_sjsr_AnonFunction0.prototype.constructor = $c_sjsr_AnonFunction0;
/** @constructor */
function $h_sjsr_AnonFunction0() {
  /*<skip>*/
}
$h_sjsr_AnonFunction0.prototype = $c_sjsr_AnonFunction0.prototype;
$c_sjsr_AnonFunction0.prototype.apply__O = (function() {
  return (0, this.f$2)()
});
$c_sjsr_AnonFunction0.prototype.init___sjs_js_Function0 = (function(f) {
  this.f$2 = f;
  return this
});
var $d_sjsr_AnonFunction0 = new $TypeData().initClass({
  sjsr_AnonFunction0: 0
}, false, "scala.scalajs.runtime.AnonFunction0", {
  sjsr_AnonFunction0: 1,
  sr_AbstractFunction0: 1,
  O: 1,
  F0: 1
});
$c_sjsr_AnonFunction0.prototype.$classData = $d_sjsr_AnonFunction0;
/** @constructor */
function $c_sjsr_AnonFunction1() {
  $c_sr_AbstractFunction1.call(this);
  this.f$2 = null
}
$c_sjsr_AnonFunction1.prototype = new $h_sr_AbstractFunction1();
$c_sjsr_AnonFunction1.prototype.constructor = $c_sjsr_AnonFunction1;
/** @constructor */
function $h_sjsr_AnonFunction1() {
  /*<skip>*/
}
$h_sjsr_AnonFunction1.prototype = $c_sjsr_AnonFunction1.prototype;
$c_sjsr_AnonFunction1.prototype.apply__O__O = (function(arg1) {
  return (0, this.f$2)(arg1)
});
$c_sjsr_AnonFunction1.prototype.init___sjs_js_Function1 = (function(f) {
  this.f$2 = f;
  return this
});
var $d_sjsr_AnonFunction1 = new $TypeData().initClass({
  sjsr_AnonFunction1: 0
}, false, "scala.scalajs.runtime.AnonFunction1", {
  sjsr_AnonFunction1: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1
});
$c_sjsr_AnonFunction1.prototype.$classData = $d_sjsr_AnonFunction1;
/** @constructor */
function $c_sjsr_AnonFunction2() {
  $c_sr_AbstractFunction2.call(this);
  this.f$2 = null
}
$c_sjsr_AnonFunction2.prototype = new $h_sr_AbstractFunction2();
$c_sjsr_AnonFunction2.prototype.constructor = $c_sjsr_AnonFunction2;
/** @constructor */
function $h_sjsr_AnonFunction2() {
  /*<skip>*/
}
$h_sjsr_AnonFunction2.prototype = $c_sjsr_AnonFunction2.prototype;
$c_sjsr_AnonFunction2.prototype.init___sjs_js_Function2 = (function(f) {
  this.f$2 = f;
  return this
});
$c_sjsr_AnonFunction2.prototype.apply__O__O__O = (function(arg1, arg2) {
  return (0, this.f$2)(arg1, arg2)
});
var $d_sjsr_AnonFunction2 = new $TypeData().initClass({
  sjsr_AnonFunction2: 0
}, false, "scala.scalajs.runtime.AnonFunction2", {
  sjsr_AnonFunction2: 1,
  sr_AbstractFunction2: 1,
  O: 1,
  F2: 1
});
$c_sjsr_AnonFunction2.prototype.$classData = $d_sjsr_AnonFunction2;
/** @constructor */
function $c_sjsr_AnonFunction3() {
  $c_sr_AbstractFunction3.call(this);
  this.f$2 = null
}
$c_sjsr_AnonFunction3.prototype = new $h_sr_AbstractFunction3();
$c_sjsr_AnonFunction3.prototype.constructor = $c_sjsr_AnonFunction3;
/** @constructor */
function $h_sjsr_AnonFunction3() {
  /*<skip>*/
}
$h_sjsr_AnonFunction3.prototype = $c_sjsr_AnonFunction3.prototype;
$c_sjsr_AnonFunction3.prototype.init___sjs_js_Function3 = (function(f) {
  this.f$2 = f;
  return this
});
$c_sjsr_AnonFunction3.prototype.apply__O__O__O__O = (function(arg1, arg2, arg3) {
  return (0, this.f$2)(arg1, arg2, arg3)
});
var $d_sjsr_AnonFunction3 = new $TypeData().initClass({
  sjsr_AnonFunction3: 0
}, false, "scala.scalajs.runtime.AnonFunction3", {
  sjsr_AnonFunction3: 1,
  sr_AbstractFunction3: 1,
  O: 1,
  F3: 1
});
$c_sjsr_AnonFunction3.prototype.$classData = $d_sjsr_AnonFunction3;
/** @constructor */
function $c_sjsr_RuntimeLong$() {
  $c_O.call(this);
  this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
  this.Zero$1 = null
}
$c_sjsr_RuntimeLong$.prototype = new $h_O();
$c_sjsr_RuntimeLong$.prototype.constructor = $c_sjsr_RuntimeLong$;
/** @constructor */
function $h_sjsr_RuntimeLong$() {
  /*<skip>*/
}
$h_sjsr_RuntimeLong$.prototype = $c_sjsr_RuntimeLong$.prototype;
$c_sjsr_RuntimeLong$.prototype.init___ = (function() {
  $n_sjsr_RuntimeLong$ = this;
  this.Zero$1 = new $c_sjsr_RuntimeLong().init___I__I(0, 0);
  return this
});
$c_sjsr_RuntimeLong$.prototype.Zero__sjsr_RuntimeLong = (function() {
  return this.Zero$1
});
$c_sjsr_RuntimeLong$.prototype.toUnsignedString__p1__I__I__T = (function(lo, hi) {
  if ((((-2097152) & hi) === 0)) {
    var this$5 = ((4.294967296E9 * hi) + $uD((lo >>> 0)));
    return ("" + this$5)
  } else {
    return $as_T(this.unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar(lo, hi, 1000000000, 0, 2))
  }
});
$c_sjsr_RuntimeLong$.prototype.divideImpl__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  if (((blo | bhi) === 0)) {
    throw new $c_jl_ArithmeticException().init___T("/ by zero")
  };
  if ((ahi === (alo >> 31))) {
    if ((bhi === (blo >> 31))) {
      if (((alo === (-2147483648)) && (blo === (-1)))) {
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
        return (-2147483648)
      } else {
        var lo = ((alo / blo) | 0);
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (lo >> 31);
        return lo
      }
    } else if (((alo === (-2147483648)) && ((blo === (-2147483648)) && (bhi === 0)))) {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (-1);
      return (-1)
    } else {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
      return 0
    }
  } else {
    var neg = (ahi < 0);
    if (neg) {
      var lo$1 = ((-alo) | 0);
      var hi = ((alo !== 0) ? (~ahi) : ((-ahi) | 0));
      var abs_$_lo$2 = lo$1;
      var abs_$_hi$2 = hi
    } else {
      var abs_$_lo$2 = alo;
      var abs_$_hi$2 = ahi
    };
    var neg$1 = (bhi < 0);
    if (neg$1) {
      var lo$2 = ((-blo) | 0);
      var hi$1 = ((blo !== 0) ? (~bhi) : ((-bhi) | 0));
      var abs$1_$_lo$2 = lo$2;
      var abs$1_$_hi$2 = hi$1
    } else {
      var abs$1_$_lo$2 = blo;
      var abs$1_$_hi$2 = bhi
    };
    var absRLo = this.unsigned$und$div__p1__I__I__I__I__I(abs_$_lo$2, abs_$_hi$2, abs$1_$_lo$2, abs$1_$_hi$2);
    if ((neg === neg$1)) {
      return absRLo
    } else {
      var hi$2 = this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ((absRLo !== 0) ? (~hi$2) : ((-hi$2) | 0));
      return ((-absRLo) | 0)
    }
  }
});
$c_sjsr_RuntimeLong$.prototype.scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D = (function(lo, hi) {
  if ((hi < 0)) {
    var x = ((lo !== 0) ? (~hi) : ((-hi) | 0));
    var jsx$1 = $uD((x >>> 0));
    var x$1 = ((-lo) | 0);
    return (-((4.294967296E9 * jsx$1) + $uD((x$1 >>> 0))))
  } else {
    return ((4.294967296E9 * hi) + $uD((lo >>> 0)))
  }
});
$c_sjsr_RuntimeLong$.prototype.fromDouble__D__sjsr_RuntimeLong = (function(value) {
  var lo = this.scala$scalajs$runtime$RuntimeLong$$fromDoubleImpl__D__I(value);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f)
});
$c_sjsr_RuntimeLong$.prototype.scala$scalajs$runtime$RuntimeLong$$fromDoubleImpl__D__I = (function(value) {
  if ((value < (-9.223372036854776E18))) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (-2147483648);
    return 0
  } else if ((value >= 9.223372036854776E18)) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 2147483647;
    return (-1)
  } else {
    var rawLo = $uI((value | 0));
    var x = (value / 4.294967296E9);
    var rawHi = $uI((x | 0));
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (((value < 0) && (rawLo !== 0)) ? (((-1) + rawHi) | 0) : rawHi);
    return rawLo
  }
});
$c_sjsr_RuntimeLong$.prototype.unsigned$und$div__p1__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  if ((((-2097152) & ahi) === 0)) {
    if ((((-2097152) & bhi) === 0)) {
      var aDouble = ((4.294967296E9 * ahi) + $uD((alo >>> 0)));
      var bDouble = ((4.294967296E9 * bhi) + $uD((blo >>> 0)));
      var rDouble = (aDouble / bDouble);
      var x = (rDouble / 4.294967296E9);
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = $uI((x | 0));
      return $uI((rDouble | 0))
    } else {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
      return 0
    }
  } else if (((bhi === 0) && ((blo & (((-1) + blo) | 0)) === 0))) {
    var pow = ((31 - $clz32(blo)) | 0);
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ((ahi >>> pow) | 0);
    return (((alo >>> pow) | 0) | ((ahi << 1) << ((31 - pow) | 0)))
  } else if (((blo === 0) && ((bhi & (((-1) + bhi) | 0)) === 0))) {
    var pow$2 = ((31 - $clz32(bhi)) | 0);
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
    return ((ahi >>> pow$2) | 0)
  } else {
    return $uI(this.unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar(alo, ahi, blo, bhi, 0))
  }
});
$c_sjsr_RuntimeLong$.prototype.divideUnsignedImpl__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  if (((blo | bhi) === 0)) {
    throw new $c_jl_ArithmeticException().init___T("/ by zero")
  };
  if ((ahi === 0)) {
    if ((bhi === 0)) {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
      var x = ($uD((alo >>> 0)) / $uD((blo >>> 0)));
      return $uI((x | 0))
    } else {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
      return 0
    }
  } else {
    return this.unsigned$und$div__p1__I__I__I__I__I(alo, ahi, blo, bhi)
  }
});
$c_sjsr_RuntimeLong$.prototype.scala$scalajs$runtime$RuntimeLong$$toString__I__I__T = (function(lo, hi) {
  return ((hi === (lo >> 31)) ? ("" + lo) : ((hi < 0) ? ("-" + this.toUnsignedString__p1__I__I__T(((-lo) | 0), ((lo !== 0) ? (~hi) : ((-hi) | 0)))) : this.toUnsignedString__p1__I__I__T(lo, hi)))
});
$c_sjsr_RuntimeLong$.prototype.scala$scalajs$runtime$RuntimeLong$$compare__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  return ((ahi === bhi) ? ((alo === blo) ? 0 : ((((-2147483648) ^ alo) < ((-2147483648) ^ blo)) ? (-1) : 1)) : ((ahi < bhi) ? (-1) : 1))
});
$c_sjsr_RuntimeLong$.prototype.unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar = (function(alo, ahi, blo, bhi, ask) {
  var shift = ((((bhi !== 0) ? $clz32(bhi) : ((32 + $clz32(blo)) | 0)) - ((ahi !== 0) ? $clz32(ahi) : ((32 + $clz32(alo)) | 0))) | 0);
  var n = shift;
  var lo = (((32 & n) === 0) ? (blo << n) : 0);
  var hi = (((32 & n) === 0) ? (((((blo >>> 1) | 0) >>> ((31 - n) | 0)) | 0) | (bhi << n)) : (blo << n));
  var bShiftLo = lo;
  var bShiftHi = hi;
  var remLo = alo;
  var remHi = ahi;
  var quotLo = 0;
  var quotHi = 0;
  while (((shift >= 0) && (((-2097152) & remHi) !== 0))) {
    var alo$1 = remLo;
    var ahi$1 = remHi;
    var blo$1 = bShiftLo;
    var bhi$1 = bShiftHi;
    if (((ahi$1 === bhi$1) ? (((-2147483648) ^ alo$1) >= ((-2147483648) ^ blo$1)) : (((-2147483648) ^ ahi$1) >= ((-2147483648) ^ bhi$1)))) {
      var lo$1 = remLo;
      var hi$1 = remHi;
      var lo$2 = bShiftLo;
      var hi$2 = bShiftHi;
      var lo$3 = ((lo$1 - lo$2) | 0);
      var hi$3 = ((((-2147483648) ^ lo$3) > ((-2147483648) ^ lo$1)) ? (((-1) + ((hi$1 - hi$2) | 0)) | 0) : ((hi$1 - hi$2) | 0));
      remLo = lo$3;
      remHi = hi$3;
      if ((shift < 32)) {
        quotLo = (quotLo | (1 << shift))
      } else {
        quotHi = (quotHi | (1 << shift))
      }
    };
    shift = (((-1) + shift) | 0);
    var lo$4 = bShiftLo;
    var hi$4 = bShiftHi;
    var lo$5 = (((lo$4 >>> 1) | 0) | (hi$4 << 31));
    var hi$5 = ((hi$4 >>> 1) | 0);
    bShiftLo = lo$5;
    bShiftHi = hi$5
  };
  var alo$2 = remLo;
  var ahi$2 = remHi;
  if (((ahi$2 === bhi) ? (((-2147483648) ^ alo$2) >= ((-2147483648) ^ blo)) : (((-2147483648) ^ ahi$2) >= ((-2147483648) ^ bhi)))) {
    var lo$6 = remLo;
    var hi$6 = remHi;
    var remDouble = ((4.294967296E9 * hi$6) + $uD((lo$6 >>> 0)));
    var bDouble = ((4.294967296E9 * bhi) + $uD((blo >>> 0)));
    if ((ask !== 1)) {
      var x = (remDouble / bDouble);
      var lo$7 = $uI((x | 0));
      var x$1 = (x / 4.294967296E9);
      var hi$7 = $uI((x$1 | 0));
      var lo$8 = quotLo;
      var hi$8 = quotHi;
      var lo$9 = ((lo$8 + lo$7) | 0);
      var hi$9 = ((((-2147483648) ^ lo$9) < ((-2147483648) ^ lo$8)) ? ((1 + ((hi$8 + hi$7) | 0)) | 0) : ((hi$8 + hi$7) | 0));
      quotLo = lo$9;
      quotHi = hi$9
    };
    if ((ask !== 0)) {
      var rem_mod_bDouble = (remDouble % bDouble);
      remLo = $uI((rem_mod_bDouble | 0));
      var x$2 = (rem_mod_bDouble / 4.294967296E9);
      remHi = $uI((x$2 | 0))
    }
  };
  if ((ask === 0)) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = quotHi;
    var a = quotLo;
    return a
  } else if ((ask === 1)) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = remHi;
    var a$1 = remLo;
    return a$1
  } else {
    var lo$10 = quotLo;
    var hi$10 = quotHi;
    var quot = ((4.294967296E9 * hi$10) + $uD((lo$10 >>> 0)));
    var this$25 = remLo;
    var remStr = ("" + this$25);
    var a$2 = ((("" + quot) + $as_T("000000000".substring($uI(remStr.length)))) + remStr);
    return a$2
  }
});
$c_sjsr_RuntimeLong$.prototype.remainderImpl__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  if (((blo | bhi) === 0)) {
    throw new $c_jl_ArithmeticException().init___T("/ by zero")
  };
  if ((ahi === (alo >> 31))) {
    if ((bhi === (blo >> 31))) {
      if ((blo !== (-1))) {
        var lo = ((alo % blo) | 0);
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (lo >> 31);
        return lo
      } else {
        this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
        return 0
      }
    } else if (((alo === (-2147483648)) && ((blo === (-2147483648)) && (bhi === 0)))) {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
      return 0
    } else {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ahi;
      return alo
    }
  } else {
    var neg = (ahi < 0);
    if (neg) {
      var lo$1 = ((-alo) | 0);
      var hi = ((alo !== 0) ? (~ahi) : ((-ahi) | 0));
      var abs_$_lo$2 = lo$1;
      var abs_$_hi$2 = hi
    } else {
      var abs_$_lo$2 = alo;
      var abs_$_hi$2 = ahi
    };
    var neg$1 = (bhi < 0);
    if (neg$1) {
      var lo$2 = ((-blo) | 0);
      var hi$1 = ((blo !== 0) ? (~bhi) : ((-bhi) | 0));
      var abs$1_$_lo$2 = lo$2;
      var abs$1_$_hi$2 = hi$1
    } else {
      var abs$1_$_lo$2 = blo;
      var abs$1_$_hi$2 = bhi
    };
    var absRLo = this.unsigned$und$percent__p1__I__I__I__I__I(abs_$_lo$2, abs_$_hi$2, abs$1_$_lo$2, abs$1_$_hi$2);
    if (neg) {
      var hi$2 = this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f;
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ((absRLo !== 0) ? (~hi$2) : ((-hi$2) | 0));
      return ((-absRLo) | 0)
    } else {
      return absRLo
    }
  }
});
$c_sjsr_RuntimeLong$.prototype.unsigned$und$percent__p1__I__I__I__I__I = (function(alo, ahi, blo, bhi) {
  if ((((-2097152) & ahi) === 0)) {
    if ((((-2097152) & bhi) === 0)) {
      var aDouble = ((4.294967296E9 * ahi) + $uD((alo >>> 0)));
      var bDouble = ((4.294967296E9 * bhi) + $uD((blo >>> 0)));
      var rDouble = (aDouble % bDouble);
      var x = (rDouble / 4.294967296E9);
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = $uI((x | 0));
      return $uI((rDouble | 0))
    } else {
      this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = ahi;
      return alo
    }
  } else if (((bhi === 0) && ((blo & (((-1) + blo) | 0)) === 0))) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = 0;
    return (alo & (((-1) + blo) | 0))
  } else if (((blo === 0) && ((bhi & (((-1) + bhi) | 0)) === 0))) {
    this.scala$scalajs$runtime$RuntimeLong$$hiReturn$f = (ahi & (((-1) + bhi) | 0));
    return alo
  } else {
    return $uI(this.unsignedDivModHelper__p1__I__I__I__I__I__sjs_js_$bar(alo, ahi, blo, bhi, 1))
  }
});
var $d_sjsr_RuntimeLong$ = new $TypeData().initClass({
  sjsr_RuntimeLong$: 0
}, false, "scala.scalajs.runtime.RuntimeLong$", {
  sjsr_RuntimeLong$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sjsr_RuntimeLong$.prototype.$classData = $d_sjsr_RuntimeLong$;
var $n_sjsr_RuntimeLong$ = (void 0);
function $m_sjsr_RuntimeLong$() {
  if ((!$n_sjsr_RuntimeLong$)) {
    $n_sjsr_RuntimeLong$ = new $c_sjsr_RuntimeLong$().init___()
  };
  return $n_sjsr_RuntimeLong$
}
/** @constructor */
function $c_sr_AbstractPartialFunction() {
  $c_O.call(this)
}
$c_sr_AbstractPartialFunction.prototype = new $h_O();
$c_sr_AbstractPartialFunction.prototype.constructor = $c_sr_AbstractPartialFunction;
/** @constructor */
function $h_sr_AbstractPartialFunction() {
  /*<skip>*/
}
$h_sr_AbstractPartialFunction.prototype = $c_sr_AbstractPartialFunction.prototype;
$c_sr_AbstractPartialFunction.prototype.apply__O__O = (function(x) {
  return this.applyOrElse__O__F1__O(x, $m_s_PartialFunction$().empty$undpf$1)
});
$c_sr_AbstractPartialFunction.prototype.toString__T = (function() {
  return "<function1>"
});
$c_sr_AbstractPartialFunction.prototype.andThen__F1__F1 = (function(g) {
  return new $c_s_PartialFunction$AndThen().init___s_PartialFunction__F1(this, g)
});
var $d_sr_Nothing$ = new $TypeData().initClass({
  sr_Nothing$: 0
}, false, "scala.runtime.Nothing$", {
  sr_Nothing$: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
function $is_Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot)))
}
function $as_Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot(obj) {
  return (($is_Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.component.Js$UnmountedWithRoot"))
}
function $isArrayOf_Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot)))
}
function $asArrayOf_Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.component.Js$UnmountedWithRoot;", depth))
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidUpdate() {
  $c_O.call(this);
  this.raw$1 = null;
  this.prevProps$1 = null;
  this.prevState$1 = null
}
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidUpdate.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidUpdate.prototype.constructor = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidUpdate;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidUpdate() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidUpdate.prototype = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidUpdate.prototype;
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidUpdate.prototype.raw__Ljapgolly_scalajs_react_raw_package$ReactComponent = (function() {
  return this.raw$1
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidUpdate.prototype.toString__T = (function() {
  return $m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$().japgolly$scalajs$react$component$ScalaBuilder$Lifecycle$$wrapTostring__T__T(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["ComponentDidUpdate(props: ", " \u2192 ", ", state: ", " \u2192 ", ")"])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.prevProps$1, $f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this).props__O(), this.prevState$1, $f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this).state__O()])))
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidUpdate.prototype.init___Ljapgolly_scalajs_react_raw_package$ReactComponent__O__O = (function(raw, prevProps, prevState) {
  this.raw$1 = raw;
  this.prevProps$1 = prevProps;
  this.prevState$1 = prevState;
  return this
});
function $is_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidUpdate(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidUpdate)))
}
function $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidUpdate(obj) {
  return (($is_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidUpdate(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.component.ScalaBuilder$Lifecycle$ComponentDidUpdate"))
}
function $isArrayOf_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidUpdate(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidUpdate)))
}
function $asArrayOf_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidUpdate(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidUpdate(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.component.ScalaBuilder$Lifecycle$ComponentDidUpdate;", depth))
}
var $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidUpdate = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidUpdate: 0
}, false, "japgolly.scalajs.react.component.ScalaBuilder$Lifecycle$ComponentDidUpdate", {
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidUpdate: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$StateW: 1,
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base: 1,
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ForceUpdate: 1
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidUpdate.prototype.$classData = $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidUpdate;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount() {
  $c_O.call(this);
  this.raw$1 = null
}
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount.prototype.constructor = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount.prototype = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount.prototype;
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount.prototype.raw__Ljapgolly_scalajs_react_raw_package$ReactComponent = (function() {
  return this.raw$1
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount.prototype.init___Ljapgolly_scalajs_react_raw_package$ReactComponent = (function(raw) {
  this.raw$1 = raw;
  return this
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount.prototype.equals__O__Z = (function(x$1) {
  return $m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount$().equals$extension__Ljapgolly_scalajs_react_raw_package$ReactComponent__O__Z(this.raw$1, x$1)
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount.prototype.toString__T = (function() {
  return $m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount$().toString$extension__Ljapgolly_scalajs_react_raw_package$ReactComponent__T(this.raw$1)
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount.prototype.hashCode__I = (function() {
  var $$this = this.raw$1;
  return $objectHashCode($$this)
});
function $is_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount)))
}
function $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount(obj) {
  return (($is_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.component.ScalaBuilder$Lifecycle$ComponentWillMount"))
}
function $isArrayOf_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount)))
}
function $asArrayOf_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.component.ScalaBuilder$Lifecycle$ComponentWillMount;", depth))
}
var $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount: 0
}, false, "japgolly.scalajs.react.component.ScalaBuilder$Lifecycle$ComponentWillMount", {
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$StateRW: 1,
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$StateW: 1,
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base: 1
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount.prototype.$classData = $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillMount;
function $is_Ljapgolly_scalajs_react_extra_router_Action(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_extra_router_Action)))
}
function $as_Ljapgolly_scalajs_react_extra_router_Action(obj) {
  return (($is_Ljapgolly_scalajs_react_extra_router_Action(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.extra.router.Action"))
}
function $isArrayOf_Ljapgolly_scalajs_react_extra_router_Action(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_extra_router_Action)))
}
function $asArrayOf_Ljapgolly_scalajs_react_extra_router_Action(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_extra_router_Action(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.extra.router.Action;", depth))
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$() {
  $c_O.call(this);
  this.backgroundAttachment$module$1 = null;
  this.backgroundOrigin$module$1 = null;
  this.backgroundClip$module$1 = null;
  this.backgroundSize$module$1 = null;
  this.borderCollapse$module$1 = null;
  this.borderSpacing$module$1 = null;
  this.boxSizing$module$1 = null;
  this.color$module$1 = null;
  this.clip$module$1 = null;
  this.cursor$module$1 = null;
  this.float$module$1 = null;
  this.direction$module$1 = null;
  this.display$module$1 = null;
  this.pointerEvents$module$1 = null;
  this.listStyleImage$module$1 = null;
  this.listStylePosition$module$1 = null;
  this.wordWrap$module$1 = null;
  this.verticalAlign$module$1 = null;
  this.mask$module$1 = null;
  this.emptyCells$module$1 = null;
  this.listStyleType$module$1 = null;
  this.captionSide$module$1 = null;
  this.position$module$1 = null;
  this.quotes$module$1 = null;
  this.tableLayout$module$1 = null;
  this.fontSize$module$1 = null;
  this.fontWeight$module$1 = null;
  this.fontStyle$module$1 = null;
  this.clear$module$1 = null;
  this.outlineWidth$module$1 = null;
  this.outlineColor$module$1 = null;
  this.textDecoration$module$1 = null;
  this.textOverflow$module$1 = null;
  this.textUnderlinePosition$module$1 = null;
  this.textTransform$module$1 = null;
  this.visibility$module$1 = null;
  this.whiteSpace$module$1 = null;
  this.backfaceVisibility$module$1 = null;
  this.columns$module$1 = null;
  this.columnFill$module$1 = null;
  this.columnSpan$module$1 = null;
  this.columnRuleWidth$module$1 = null;
  this.columnRuleStyle$module$1 = null;
  this.alignContent$module$1 = null;
  this.alignSelf$module$1 = null;
  this.flexWrap$module$1 = null;
  this.alignItems$module$1 = null;
  this.justifyContent$module$1 = null;
  this.flexDirection$module$1 = null;
  this.transformStyle$module$1 = null;
  this.unicodeBidi$module$1 = null;
  this.wordBreak$module$1 = null;
  this.aria$module$1 = null;
  this.autoComplete$module$1 = null;
  this.key$1 = null;
  this.onChange$1 = null;
  this.onClick$1 = null;
  this.onClickCapture$1 = null;
  this.src$1 = null;
  this.target$module$1 = null;
  this.title$1 = null;
  this.type$1 = null;
  this.value$1 = null;
  this.wrap$module$1 = null
}
$c_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$.prototype = $c_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$.prototype;
$c_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$.prototype.init___ = (function() {
  $n_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$ = this;
  $f_Ljapgolly_scalajs_react_vdom_HtmlAttrs__$$init$__V(this);
  return this
});
$c_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$.prototype.japgolly$scalajs$react$vdom$HtmlAttrs$$undsetter$und$onChange$und$eq__Ljapgolly_scalajs_react_vdom_Attr$Event__V = (function(x$1) {
  this.onChange$1 = x$1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$.prototype.japgolly$scalajs$react$vdom$HtmlAttrs$$undsetter$und$title$und$eq__Ljapgolly_scalajs_react_vdom_Attr__V = (function(x$1) {
  this.title$1 = x$1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$.prototype.japgolly$scalajs$react$vdom$HtmlAttrs$$undsetter$und$onClickCapture$und$eq__Ljapgolly_scalajs_react_vdom_Attr$Event__V = (function(x$1) {
  this.onClickCapture$1 = x$1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$.prototype.japgolly$scalajs$react$vdom$HtmlAttrs$$undsetter$und$key$und$eq__Ljapgolly_scalajs_react_vdom_Attr__V = (function(x$1) {
  this.key$1 = x$1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$.prototype.japgolly$scalajs$react$vdom$HtmlAttrs$$undsetter$und$value$und$eq__Ljapgolly_scalajs_react_vdom_Attr__V = (function(x$1) {
  this.value$1 = x$1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$.prototype.japgolly$scalajs$react$vdom$HtmlAttrs$$undsetter$und$onClick$und$eq__Ljapgolly_scalajs_react_vdom_Attr$Event__V = (function(x$1) {
  this.onClick$1 = x$1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$.prototype.japgolly$scalajs$react$vdom$HtmlAttrs$$undsetter$und$type$und$eq__Ljapgolly_scalajs_react_vdom_Attr__V = (function(x$1) {
  this.type$1 = x$1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$.prototype.japgolly$scalajs$react$vdom$HtmlAttrs$$undsetter$und$src$und$eq__Ljapgolly_scalajs_react_vdom_Attr__V = (function(x$1) {
  this.src$1 = x$1
});
var $d_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$: 0
}, false, "japgolly.scalajs.react.vdom.HtmlAttrAndStyles$", {
  Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles: 1,
  Ljapgolly_scalajs_react_vdom_HtmlAttrs: 1,
  Ljapgolly_scalajs_react_vdom_HtmlStyles: 1
});
$c_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$;
var $n_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$)) {
    $n_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$ = new $c_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$
}
function $is_T(obj) {
  return ((typeof obj) === "string")
}
function $as_T(obj) {
  return (($is_T(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.String"))
}
function $isArrayOf_T(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T)))
}
function $asArrayOf_T(obj, depth) {
  return (($isArrayOf_T(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.String;", depth))
}
var $d_T = new $TypeData().initClass({
  T: 0
}, false, "java.lang.String", {
  T: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_CharSequence: 1,
  jl_Comparable: 1
}, (void 0), (void 0), $is_T);
/** @constructor */
function $c_jl_AssertionError() {
  $c_jl_Error.call(this)
}
$c_jl_AssertionError.prototype = new $h_jl_Error();
$c_jl_AssertionError.prototype.constructor = $c_jl_AssertionError;
/** @constructor */
function $h_jl_AssertionError() {
  /*<skip>*/
}
$h_jl_AssertionError.prototype = $c_jl_AssertionError.prototype;
$c_jl_AssertionError.prototype.init___O = (function(o) {
  var s = $objectToString(o);
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_AssertionError = new $TypeData().initClass({
  jl_AssertionError: 0
}, false, "java.lang.AssertionError", {
  jl_AssertionError: 1,
  jl_Error: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_AssertionError.prototype.$classData = $d_jl_AssertionError;
var $d_jl_Byte = new $TypeData().initClass({
  jl_Byte: 0
}, false, "java.lang.Byte", {
  jl_Byte: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isByte(x)
}));
/** @constructor */
function $c_jl_CloneNotSupportedException() {
  $c_jl_Exception.call(this)
}
$c_jl_CloneNotSupportedException.prototype = new $h_jl_Exception();
$c_jl_CloneNotSupportedException.prototype.constructor = $c_jl_CloneNotSupportedException;
/** @constructor */
function $h_jl_CloneNotSupportedException() {
  /*<skip>*/
}
$h_jl_CloneNotSupportedException.prototype = $c_jl_CloneNotSupportedException.prototype;
$c_jl_CloneNotSupportedException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
var $d_jl_CloneNotSupportedException = new $TypeData().initClass({
  jl_CloneNotSupportedException: 0
}, false, "java.lang.CloneNotSupportedException", {
  jl_CloneNotSupportedException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_CloneNotSupportedException.prototype.$classData = $d_jl_CloneNotSupportedException;
function $isArrayOf_jl_Double(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Double)))
}
function $asArrayOf_jl_Double(obj, depth) {
  return (($isArrayOf_jl_Double(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Double;", depth))
}
var $d_jl_Double = new $TypeData().initClass({
  jl_Double: 0
}, false, "java.lang.Double", {
  jl_Double: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return ((typeof x) === "number")
}));
var $d_jl_Float = new $TypeData().initClass({
  jl_Float: 0
}, false, "java.lang.Float", {
  jl_Float: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isFloat(x)
}));
var $d_jl_Integer = new $TypeData().initClass({
  jl_Integer: 0
}, false, "java.lang.Integer", {
  jl_Integer: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isInt(x)
}));
function $isArrayOf_jl_Long(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Long)))
}
function $asArrayOf_jl_Long(obj, depth) {
  return (($isArrayOf_jl_Long(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.Long;", depth))
}
var $d_jl_Long = new $TypeData().initClass({
  jl_Long: 0
}, false, "java.lang.Long", {
  jl_Long: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $is_sjsr_RuntimeLong(x)
}));
/** @constructor */
function $c_jl_RuntimeException() {
  $c_jl_Exception.call(this)
}
$c_jl_RuntimeException.prototype = new $h_jl_Exception();
$c_jl_RuntimeException.prototype.constructor = $c_jl_RuntimeException;
/** @constructor */
function $h_jl_RuntimeException() {
  /*<skip>*/
}
$h_jl_RuntimeException.prototype = $c_jl_RuntimeException.prototype;
$c_jl_RuntimeException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_RuntimeException = new $TypeData().initClass({
  jl_RuntimeException: 0
}, false, "java.lang.RuntimeException", {
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_RuntimeException.prototype.$classData = $d_jl_RuntimeException;
var $d_jl_Short = new $TypeData().initClass({
  jl_Short: 0
}, false, "java.lang.Short", {
  jl_Short: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
}, (void 0), (void 0), (function(x) {
  return $isShort(x)
}));
/** @constructor */
function $c_jl_StringBuffer() {
  $c_O.call(this);
  this.content$1 = null
}
$c_jl_StringBuffer.prototype = new $h_O();
$c_jl_StringBuffer.prototype.constructor = $c_jl_StringBuffer;
/** @constructor */
function $h_jl_StringBuffer() {
  /*<skip>*/
}
$h_jl_StringBuffer.prototype = $c_jl_StringBuffer.prototype;
$c_jl_StringBuffer.prototype.init___ = (function() {
  $c_jl_StringBuffer.prototype.init___T.call(this, "");
  return this
});
$c_jl_StringBuffer.prototype.subSequence__I__I__jl_CharSequence = (function(start, end) {
  var thiz = this.content$1;
  return $as_T(thiz.substring(start, end))
});
$c_jl_StringBuffer.prototype.toString__T = (function() {
  return this.content$1
});
$c_jl_StringBuffer.prototype.length__I = (function() {
  var thiz = this.content$1;
  return $uI(thiz.length)
});
$c_jl_StringBuffer.prototype.append__T__jl_StringBuffer = (function(s) {
  this.content$1 = (("" + this.content$1) + ((s === null) ? "null" : s));
  return this
});
$c_jl_StringBuffer.prototype.init___T = (function(content) {
  this.content$1 = content;
  return this
});
$c_jl_StringBuffer.prototype.append__C__jl_StringBuffer = (function(c) {
  return this.append__T__jl_StringBuffer($as_T($g.String.fromCharCode(c)))
});
var $d_jl_StringBuffer = new $TypeData().initClass({
  jl_StringBuffer: 0
}, false, "java.lang.StringBuffer", {
  jl_StringBuffer: 1,
  O: 1,
  jl_CharSequence: 1,
  jl_Appendable: 1,
  Ljava_io_Serializable: 1
});
$c_jl_StringBuffer.prototype.$classData = $d_jl_StringBuffer;
/** @constructor */
function $c_jl_StringBuilder() {
  $c_O.call(this);
  this.content$1 = null
}
$c_jl_StringBuilder.prototype = new $h_O();
$c_jl_StringBuilder.prototype.constructor = $c_jl_StringBuilder;
/** @constructor */
function $h_jl_StringBuilder() {
  /*<skip>*/
}
$h_jl_StringBuilder.prototype = $c_jl_StringBuilder.prototype;
$c_jl_StringBuilder.prototype.init___ = (function() {
  $c_jl_StringBuilder.prototype.init___T.call(this, "");
  return this
});
$c_jl_StringBuilder.prototype.append__T__jl_StringBuilder = (function(s) {
  this.content$1 = (("" + this.content$1) + ((s === null) ? "null" : s));
  return this
});
$c_jl_StringBuilder.prototype.subSequence__I__I__jl_CharSequence = (function(start, end) {
  var thiz = this.content$1;
  return $as_T(thiz.substring(start, end))
});
$c_jl_StringBuilder.prototype.toString__T = (function() {
  return this.content$1
});
$c_jl_StringBuilder.prototype.append__O__jl_StringBuilder = (function(obj) {
  return ((obj === null) ? this.append__T__jl_StringBuilder(null) : this.append__T__jl_StringBuilder($objectToString(obj)))
});
$c_jl_StringBuilder.prototype.init___I = (function(initialCapacity) {
  $c_jl_StringBuilder.prototype.init___T.call(this, "");
  return this
});
$c_jl_StringBuilder.prototype.append__jl_CharSequence__I__I__jl_StringBuilder = (function(csq, start, end) {
  return ((csq === null) ? this.append__jl_CharSequence__I__I__jl_StringBuilder("null", start, end) : this.append__T__jl_StringBuilder($objectToString($charSequenceSubSequence(csq, start, end))))
});
$c_jl_StringBuilder.prototype.length__I = (function() {
  var thiz = this.content$1;
  return $uI(thiz.length)
});
$c_jl_StringBuilder.prototype.append__C__jl_StringBuilder = (function(c) {
  return this.append__T__jl_StringBuilder($as_T($g.String.fromCharCode(c)))
});
$c_jl_StringBuilder.prototype.init___T = (function(content) {
  this.content$1 = content;
  return this
});
var $d_jl_StringBuilder = new $TypeData().initClass({
  jl_StringBuilder: 0
}, false, "java.lang.StringBuilder", {
  jl_StringBuilder: 1,
  O: 1,
  jl_CharSequence: 1,
  jl_Appendable: 1,
  Ljava_io_Serializable: 1
});
$c_jl_StringBuilder.prototype.$classData = $d_jl_StringBuilder;
/** @constructor */
function $c_s_Array$() {
  $c_s_FallbackArrayBuilding.call(this)
}
$c_s_Array$.prototype = new $h_s_FallbackArrayBuilding();
$c_s_Array$.prototype.constructor = $c_s_Array$;
/** @constructor */
function $h_s_Array$() {
  /*<skip>*/
}
$h_s_Array$.prototype = $c_s_Array$.prototype;
$c_s_Array$.prototype.init___ = (function() {
  return this
});
$c_s_Array$.prototype.slowcopy__p2__O__I__O__I__I__V = (function(src, srcPos, dest, destPos, length) {
  var i = srcPos;
  var j = destPos;
  var srcUntil = ((srcPos + length) | 0);
  while ((i < srcUntil)) {
    $m_sr_ScalaRunTime$().array$undupdate__O__I__O__V(dest, j, $m_sr_ScalaRunTime$().array$undapply__O__I__O(src, i));
    i = ((1 + i) | 0);
    j = ((1 + j) | 0)
  }
});
$c_s_Array$.prototype.copy__O__I__O__I__I__V = (function(src, srcPos, dest, destPos, length) {
  var srcClass = $objectGetClass(src);
  if ((srcClass.isArray__Z() && $objectGetClass(dest).isAssignableFrom__jl_Class__Z(srcClass))) {
    $systemArraycopy(src, srcPos, dest, destPos, length)
  } else {
    this.slowcopy__p2__O__I__O__I__I__V(src, srcPos, dest, destPos, length)
  }
});
var $d_s_Array$ = new $TypeData().initClass({
  s_Array$: 0
}, false, "scala.Array$", {
  s_Array$: 1,
  s_FallbackArrayBuilding: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Array$.prototype.$classData = $d_s_Array$;
var $n_s_Array$ = (void 0);
function $m_s_Array$() {
  if ((!$n_s_Array$)) {
    $n_s_Array$ = new $c_s_Array$().init___()
  };
  return $n_s_Array$
}
/** @constructor */
function $c_s_Predef$$eq$colon$eq() {
  $c_O.call(this)
}
$c_s_Predef$$eq$colon$eq.prototype = new $h_O();
$c_s_Predef$$eq$colon$eq.prototype.constructor = $c_s_Predef$$eq$colon$eq;
/** @constructor */
function $h_s_Predef$$eq$colon$eq() {
  /*<skip>*/
}
$h_s_Predef$$eq$colon$eq.prototype = $c_s_Predef$$eq$colon$eq.prototype;
$c_s_Predef$$eq$colon$eq.prototype.toString__T = (function() {
  return "<function1>"
});
$c_s_Predef$$eq$colon$eq.prototype.andThen__F1__F1 = (function(g) {
  return new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, g$1) {
    return (function(x$2) {
      return g$1.apply__O__O($this.apply__O__O(x$2))
    })
  })(this, g))
});
/** @constructor */
function $c_s_Predef$$less$colon$less() {
  $c_O.call(this)
}
$c_s_Predef$$less$colon$less.prototype = new $h_O();
$c_s_Predef$$less$colon$less.prototype.constructor = $c_s_Predef$$less$colon$less;
/** @constructor */
function $h_s_Predef$$less$colon$less() {
  /*<skip>*/
}
$h_s_Predef$$less$colon$less.prototype = $c_s_Predef$$less$colon$less.prototype;
$c_s_Predef$$less$colon$less.prototype.toString__T = (function() {
  return "<function1>"
});
$c_s_Predef$$less$colon$less.prototype.andThen__F1__F1 = (function(g) {
  return new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, g$1) {
    return (function(x$2) {
      return g$1.apply__O__O($this.apply__O__O(x$2))
    })
  })(this, g))
});
/** @constructor */
function $c_s_math_Equiv$() {
  $c_O.call(this)
}
$c_s_math_Equiv$.prototype = new $h_O();
$c_s_math_Equiv$.prototype.constructor = $c_s_math_Equiv$;
/** @constructor */
function $h_s_math_Equiv$() {
  /*<skip>*/
}
$h_s_math_Equiv$.prototype = $c_s_math_Equiv$.prototype;
$c_s_math_Equiv$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Equiv$ = new $TypeData().initClass({
  s_math_Equiv$: 0
}, false, "scala.math.Equiv$", {
  s_math_Equiv$: 1,
  O: 1,
  s_math_LowPriorityEquiv: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Equiv$.prototype.$classData = $d_s_math_Equiv$;
var $n_s_math_Equiv$ = (void 0);
function $m_s_math_Equiv$() {
  if ((!$n_s_math_Equiv$)) {
    $n_s_math_Equiv$ = new $c_s_math_Equiv$().init___()
  };
  return $n_s_math_Equiv$
}
/** @constructor */
function $c_s_math_Ordering$() {
  $c_O.call(this)
}
$c_s_math_Ordering$.prototype = new $h_O();
$c_s_math_Ordering$.prototype.constructor = $c_s_math_Ordering$;
/** @constructor */
function $h_s_math_Ordering$() {
  /*<skip>*/
}
$h_s_math_Ordering$.prototype = $c_s_math_Ordering$.prototype;
$c_s_math_Ordering$.prototype.init___ = (function() {
  return this
});
var $d_s_math_Ordering$ = new $TypeData().initClass({
  s_math_Ordering$: 0
}, false, "scala.math.Ordering$", {
  s_math_Ordering$: 1,
  O: 1,
  s_math_LowPriorityOrderingImplicits: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_math_Ordering$.prototype.$classData = $d_s_math_Ordering$;
var $n_s_math_Ordering$ = (void 0);
function $m_s_math_Ordering$() {
  if ((!$n_s_math_Ordering$)) {
    $n_s_math_Ordering$ = new $c_s_math_Ordering$().init___()
  };
  return $n_s_math_Ordering$
}
/** @constructor */
function $c_s_reflect_NoManifest$() {
  $c_O.call(this)
}
$c_s_reflect_NoManifest$.prototype = new $h_O();
$c_s_reflect_NoManifest$.prototype.constructor = $c_s_reflect_NoManifest$;
/** @constructor */
function $h_s_reflect_NoManifest$() {
  /*<skip>*/
}
$h_s_reflect_NoManifest$.prototype = $c_s_reflect_NoManifest$.prototype;
$c_s_reflect_NoManifest$.prototype.init___ = (function() {
  return this
});
$c_s_reflect_NoManifest$.prototype.toString__T = (function() {
  return "<?>"
});
var $d_s_reflect_NoManifest$ = new $TypeData().initClass({
  s_reflect_NoManifest$: 0
}, false, "scala.reflect.NoManifest$", {
  s_reflect_NoManifest$: 1,
  O: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_reflect_NoManifest$.prototype.$classData = $d_s_reflect_NoManifest$;
var $n_s_reflect_NoManifest$ = (void 0);
function $m_s_reflect_NoManifest$() {
  if ((!$n_s_reflect_NoManifest$)) {
    $n_s_reflect_NoManifest$ = new $c_s_reflect_NoManifest$().init___()
  };
  return $n_s_reflect_NoManifest$
}
/** @constructor */
function $c_sc_AbstractIterator() {
  $c_O.call(this)
}
$c_sc_AbstractIterator.prototype = new $h_O();
$c_sc_AbstractIterator.prototype.constructor = $c_sc_AbstractIterator;
/** @constructor */
function $h_sc_AbstractIterator() {
  /*<skip>*/
}
$h_sc_AbstractIterator.prototype = $c_sc_AbstractIterator.prototype;
$c_sc_AbstractIterator.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sc_AbstractIterator.prototype.isEmpty__Z = (function() {
  return $f_sc_Iterator__isEmpty__Z(this)
});
$c_sc_AbstractIterator.prototype.toString__T = (function() {
  return $f_sc_Iterator__toString__T(this)
});
$c_sc_AbstractIterator.prototype.foreach__F1__V = (function(f) {
  $f_sc_Iterator__foreach__F1__V(this, f)
});
$c_sc_AbstractIterator.prototype.toStream__sci_Stream = (function() {
  return $f_sc_Iterator__toStream__sci_Stream(this)
});
$c_sc_AbstractIterator.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
/** @constructor */
function $c_scg_SetFactory() {
  $c_scg_GenSetFactory.call(this)
}
$c_scg_SetFactory.prototype = new $h_scg_GenSetFactory();
$c_scg_SetFactory.prototype.constructor = $c_scg_SetFactory;
/** @constructor */
function $h_scg_SetFactory() {
  /*<skip>*/
}
$h_scg_SetFactory.prototype = $c_scg_SetFactory.prototype;
/** @constructor */
function $c_sci_Map$() {
  $c_scg_ImmutableMapFactory.call(this)
}
$c_sci_Map$.prototype = new $h_scg_ImmutableMapFactory();
$c_sci_Map$.prototype.constructor = $c_sci_Map$;
/** @constructor */
function $h_sci_Map$() {
  /*<skip>*/
}
$h_sci_Map$.prototype = $c_sci_Map$.prototype;
$c_sci_Map$.prototype.init___ = (function() {
  return this
});
var $d_sci_Map$ = new $TypeData().initClass({
  sci_Map$: 0
}, false, "scala.collection.immutable.Map$", {
  sci_Map$: 1,
  scg_ImmutableMapFactory: 1,
  scg_MapFactory: 1,
  scg_GenMapFactory: 1,
  O: 1
});
$c_sci_Map$.prototype.$classData = $d_sci_Map$;
var $n_sci_Map$ = (void 0);
function $m_sci_Map$() {
  if ((!$n_sci_Map$)) {
    $n_sci_Map$ = new $c_sci_Map$().init___()
  };
  return $n_sci_Map$
}
/** @constructor */
function $c_scm_GrowingBuilder() {
  $c_O.call(this);
  this.empty$1 = null;
  this.elems$1 = null
}
$c_scm_GrowingBuilder.prototype = new $h_O();
$c_scm_GrowingBuilder.prototype.constructor = $c_scm_GrowingBuilder;
/** @constructor */
function $h_scm_GrowingBuilder() {
  /*<skip>*/
}
$h_scm_GrowingBuilder.prototype = $c_scm_GrowingBuilder.prototype;
$c_scm_GrowingBuilder.prototype.$$plus$eq__O__scm_GrowingBuilder = (function(x) {
  this.elems$1.$$plus$eq__O__scg_Growable(x);
  return this
});
$c_scm_GrowingBuilder.prototype.init___scg_Growable = (function(empty) {
  this.empty$1 = empty;
  this.elems$1 = empty;
  return this
});
$c_scm_GrowingBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_GrowingBuilder(elem)
});
$c_scm_GrowingBuilder.prototype.result__O = (function() {
  return this.elems$1
});
$c_scm_GrowingBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_GrowingBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_GrowingBuilder(elem)
});
$c_scm_GrowingBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_GrowingBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
});
var $d_scm_GrowingBuilder = new $TypeData().initClass({
  scm_GrowingBuilder: 0
}, false, "scala.collection.mutable.GrowingBuilder", {
  scm_GrowingBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_scm_GrowingBuilder.prototype.$classData = $d_scm_GrowingBuilder;
/** @constructor */
function $c_sjsr_RuntimeLong() {
  $c_jl_Number.call(this);
  this.lo$2 = 0;
  this.hi$2 = 0
}
$c_sjsr_RuntimeLong.prototype = new $h_jl_Number();
$c_sjsr_RuntimeLong.prototype.constructor = $c_sjsr_RuntimeLong;
/** @constructor */
function $h_sjsr_RuntimeLong() {
  /*<skip>*/
}
$h_sjsr_RuntimeLong.prototype = $c_sjsr_RuntimeLong.prototype;
$c_sjsr_RuntimeLong.prototype.longValue__J = (function() {
  return $uJ(this)
});
$c_sjsr_RuntimeLong.prototype.$$bar__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  return new $c_sjsr_RuntimeLong().init___I__I((this.lo$2 | b.lo$2), (this.hi$2 | b.hi$2))
});
$c_sjsr_RuntimeLong.prototype.$$greater$eq__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) >= ((-2147483648) ^ b.lo$2)) : (ahi > bhi))
});
$c_sjsr_RuntimeLong.prototype.byteValue__B = (function() {
  return ((this.lo$2 << 24) >> 24)
});
$c_sjsr_RuntimeLong.prototype.equals__O__Z = (function(that) {
  if ($is_sjsr_RuntimeLong(that)) {
    var x2 = $as_sjsr_RuntimeLong(that);
    return ((this.lo$2 === x2.lo$2) && (this.hi$2 === x2.hi$2))
  } else {
    return false
  }
});
$c_sjsr_RuntimeLong.prototype.$$less__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) < ((-2147483648) ^ b.lo$2)) : (ahi < bhi))
});
$c_sjsr_RuntimeLong.prototype.$$times__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var blo = b.lo$2;
  var a0 = (65535 & alo);
  var a1 = ((alo >>> 16) | 0);
  var b0 = (65535 & blo);
  var b1 = ((blo >>> 16) | 0);
  var a0b0 = $imul(a0, b0);
  var a1b0 = $imul(a1, b0);
  var a0b1 = $imul(a0, b1);
  var lo = ((a0b0 + (((a1b0 + a0b1) | 0) << 16)) | 0);
  var c1part = ((((a0b0 >>> 16) | 0) + a0b1) | 0);
  var hi = (((((((($imul(alo, b.hi$2) + $imul(this.hi$2, blo)) | 0) + $imul(a1, b1)) | 0) + ((c1part >>> 16) | 0)) | 0) + (((((65535 & c1part) + a1b0) | 0) >>> 16) | 0)) | 0);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, hi)
});
$c_sjsr_RuntimeLong.prototype.init___I__I__I = (function(l, m, h) {
  $c_sjsr_RuntimeLong.prototype.init___I__I.call(this, (l | (m << 22)), ((m >> 10) | (h << 12)));
  return this
});
$c_sjsr_RuntimeLong.prototype.$$percent__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var this$1 = $m_sjsr_RuntimeLong$();
  var lo = this$1.remainderImpl__I__I__I__I__I(this.lo$2, this.hi$2, b.lo$2, b.hi$2);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, this$1.scala$scalajs$runtime$RuntimeLong$$hiReturn$f)
});
$c_sjsr_RuntimeLong.prototype.toString__T = (function() {
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toString__I__I__T(this.lo$2, this.hi$2)
});
$c_sjsr_RuntimeLong.prototype.init___I__I = (function(lo, hi) {
  this.lo$2 = lo;
  this.hi$2 = hi;
  return this
});
$c_sjsr_RuntimeLong.prototype.compareTo__O__I = (function(x$1) {
  var that = $as_sjsr_RuntimeLong(x$1);
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$compare__I__I__I__I__I(this.lo$2, this.hi$2, that.lo$2, that.hi$2)
});
$c_sjsr_RuntimeLong.prototype.$$less$eq__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) <= ((-2147483648) ^ b.lo$2)) : (ahi < bhi))
});
$c_sjsr_RuntimeLong.prototype.$$amp__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  return new $c_sjsr_RuntimeLong().init___I__I((this.lo$2 & b.lo$2), (this.hi$2 & b.hi$2))
});
$c_sjsr_RuntimeLong.prototype.$$greater$greater$greater__I__sjsr_RuntimeLong = (function(n) {
  return new $c_sjsr_RuntimeLong().init___I__I((((32 & n) === 0) ? (((this.lo$2 >>> n) | 0) | ((this.hi$2 << 1) << ((31 - n) | 0))) : ((this.hi$2 >>> n) | 0)), (((32 & n) === 0) ? ((this.hi$2 >>> n) | 0) : 0))
});
$c_sjsr_RuntimeLong.prototype.$$greater__sjsr_RuntimeLong__Z = (function(b) {
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  return ((ahi === bhi) ? (((-2147483648) ^ this.lo$2) > ((-2147483648) ^ b.lo$2)) : (ahi > bhi))
});
$c_sjsr_RuntimeLong.prototype.$$less$less__I__sjsr_RuntimeLong = (function(n) {
  return new $c_sjsr_RuntimeLong().init___I__I((((32 & n) === 0) ? (this.lo$2 << n) : 0), (((32 & n) === 0) ? (((((this.lo$2 >>> 1) | 0) >>> ((31 - n) | 0)) | 0) | (this.hi$2 << n)) : (this.lo$2 << n)))
});
$c_sjsr_RuntimeLong.prototype.init___I = (function(value) {
  $c_sjsr_RuntimeLong.prototype.init___I__I.call(this, value, (value >> 31));
  return this
});
$c_sjsr_RuntimeLong.prototype.toInt__I = (function() {
  return this.lo$2
});
$c_sjsr_RuntimeLong.prototype.notEquals__sjsr_RuntimeLong__Z = (function(b) {
  return (!((this.lo$2 === b.lo$2) && (this.hi$2 === b.hi$2)))
});
$c_sjsr_RuntimeLong.prototype.unary$und$minus__sjsr_RuntimeLong = (function() {
  var lo = this.lo$2;
  var hi = this.hi$2;
  return new $c_sjsr_RuntimeLong().init___I__I(((-lo) | 0), ((lo !== 0) ? (~hi) : ((-hi) | 0)))
});
$c_sjsr_RuntimeLong.prototype.$$plus__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  var lo = ((alo + b.lo$2) | 0);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, ((((-2147483648) ^ lo) < ((-2147483648) ^ alo)) ? ((1 + ((ahi + bhi) | 0)) | 0) : ((ahi + bhi) | 0)))
});
$c_sjsr_RuntimeLong.prototype.shortValue__S = (function() {
  return ((this.lo$2 << 16) >> 16)
});
$c_sjsr_RuntimeLong.prototype.$$greater$greater__I__sjsr_RuntimeLong = (function(n) {
  return new $c_sjsr_RuntimeLong().init___I__I((((32 & n) === 0) ? (((this.lo$2 >>> n) | 0) | ((this.hi$2 << 1) << ((31 - n) | 0))) : (this.hi$2 >> n)), (((32 & n) === 0) ? (this.hi$2 >> n) : (this.hi$2 >> 31)))
});
$c_sjsr_RuntimeLong.prototype.toDouble__D = (function() {
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(this.lo$2, this.hi$2)
});
$c_sjsr_RuntimeLong.prototype.$$div__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var this$1 = $m_sjsr_RuntimeLong$();
  var lo = this$1.divideImpl__I__I__I__I__I(this.lo$2, this.hi$2, b.lo$2, b.hi$2);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, this$1.scala$scalajs$runtime$RuntimeLong$$hiReturn$f)
});
$c_sjsr_RuntimeLong.prototype.doubleValue__D = (function() {
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(this.lo$2, this.hi$2)
});
$c_sjsr_RuntimeLong.prototype.hashCode__I = (function() {
  return (this.lo$2 ^ this.hi$2)
});
$c_sjsr_RuntimeLong.prototype.intValue__I = (function() {
  return this.lo$2
});
$c_sjsr_RuntimeLong.prototype.unary$und$tilde__sjsr_RuntimeLong = (function() {
  return new $c_sjsr_RuntimeLong().init___I__I((~this.lo$2), (~this.hi$2))
});
$c_sjsr_RuntimeLong.prototype.compareTo__jl_Long__I = (function(that) {
  return $m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$compare__I__I__I__I__I(this.lo$2, this.hi$2, that.lo$2, that.hi$2)
});
$c_sjsr_RuntimeLong.prototype.floatValue__F = (function() {
  return $fround($m_sjsr_RuntimeLong$().scala$scalajs$runtime$RuntimeLong$$toDouble__I__I__D(this.lo$2, this.hi$2))
});
$c_sjsr_RuntimeLong.prototype.$$minus__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  var alo = this.lo$2;
  var ahi = this.hi$2;
  var bhi = b.hi$2;
  var lo = ((alo - b.lo$2) | 0);
  return new $c_sjsr_RuntimeLong().init___I__I(lo, ((((-2147483648) ^ lo) > ((-2147483648) ^ alo)) ? (((-1) + ((ahi - bhi) | 0)) | 0) : ((ahi - bhi) | 0)))
});
$c_sjsr_RuntimeLong.prototype.$$up__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(b) {
  return new $c_sjsr_RuntimeLong().init___I__I((this.lo$2 ^ b.lo$2), (this.hi$2 ^ b.hi$2))
});
$c_sjsr_RuntimeLong.prototype.equals__sjsr_RuntimeLong__Z = (function(b) {
  return ((this.lo$2 === b.lo$2) && (this.hi$2 === b.hi$2))
});
function $is_sjsr_RuntimeLong(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjsr_RuntimeLong)))
}
function $as_sjsr_RuntimeLong(obj) {
  return (($is_sjsr_RuntimeLong(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.runtime.RuntimeLong"))
}
function $isArrayOf_sjsr_RuntimeLong(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjsr_RuntimeLong)))
}
function $asArrayOf_sjsr_RuntimeLong(obj, depth) {
  return (($isArrayOf_sjsr_RuntimeLong(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.runtime.RuntimeLong;", depth))
}
var $d_sjsr_RuntimeLong = new $TypeData().initClass({
  sjsr_RuntimeLong: 0
}, false, "scala.scalajs.runtime.RuntimeLong", {
  sjsr_RuntimeLong: 1,
  jl_Number: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_Comparable: 1
});
$c_sjsr_RuntimeLong.prototype.$classData = $d_sjsr_RuntimeLong;
/** @constructor */
function $c_Ljapgolly_scalajs_react_CtorType$Mod() {
  $c_O.call(this);
  this.mod$1 = null
}
$c_Ljapgolly_scalajs_react_CtorType$Mod.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_CtorType$Mod.prototype.constructor = $c_Ljapgolly_scalajs_react_CtorType$Mod;
/** @constructor */
function $h_Ljapgolly_scalajs_react_CtorType$Mod() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_CtorType$Mod.prototype = $c_Ljapgolly_scalajs_react_CtorType$Mod.prototype;
$c_Ljapgolly_scalajs_react_CtorType$Mod.prototype.productPrefix__T = (function() {
  return "Mod"
});
$c_Ljapgolly_scalajs_react_CtorType$Mod.prototype.productArity__I = (function() {
  return 1
});
$c_Ljapgolly_scalajs_react_CtorType$Mod.prototype.equals__O__Z = (function(x$1) {
  return $m_Ljapgolly_scalajs_react_CtorType$Mod$().equals$extension__F1__O__Z(this.mod$1, x$1)
});
$c_Ljapgolly_scalajs_react_CtorType$Mod.prototype.productElement__I__O = (function(x$1) {
  return $m_Ljapgolly_scalajs_react_CtorType$Mod$().productElement$extension__F1__I__O(this.mod$1, x$1)
});
$c_Ljapgolly_scalajs_react_CtorType$Mod.prototype.toString__T = (function() {
  return $m_Ljapgolly_scalajs_react_CtorType$Mod$().toString$extension__F1__T(this.mod$1)
});
$c_Ljapgolly_scalajs_react_CtorType$Mod.prototype.init___F1 = (function(mod) {
  this.mod$1 = mod;
  return this
});
$c_Ljapgolly_scalajs_react_CtorType$Mod.prototype.hashCode__I = (function() {
  var $$this = this.mod$1;
  return $$this.hashCode__I()
});
$c_Ljapgolly_scalajs_react_CtorType$Mod.prototype.productIterator__sc_Iterator = (function() {
  return $m_Ljapgolly_scalajs_react_CtorType$Mod$().productIterator$extension__F1__sc_Iterator(this.mod$1)
});
function $is_Ljapgolly_scalajs_react_CtorType$Mod(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_CtorType$Mod)))
}
function $as_Ljapgolly_scalajs_react_CtorType$Mod(obj) {
  return (($is_Ljapgolly_scalajs_react_CtorType$Mod(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.CtorType$Mod"))
}
function $isArrayOf_Ljapgolly_scalajs_react_CtorType$Mod(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_CtorType$Mod)))
}
function $asArrayOf_Ljapgolly_scalajs_react_CtorType$Mod(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_CtorType$Mod(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.CtorType$Mod;", depth))
}
var $d_Ljapgolly_scalajs_react_CtorType$Mod = new $TypeData().initClass({
  Ljapgolly_scalajs_react_CtorType$Mod: 0
}, false, "japgolly.scalajs.react.CtorType$Mod", {
  Ljapgolly_scalajs_react_CtorType$Mod: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_CtorType$Mod.prototype.$classData = $d_Ljapgolly_scalajs_react_CtorType$Mod;
/** @constructor */
function $c_Ljapgolly_scalajs_react_CtorType$Mod$() {
  $c_sr_AbstractFunction1.call(this)
}
$c_Ljapgolly_scalajs_react_CtorType$Mod$.prototype = new $h_sr_AbstractFunction1();
$c_Ljapgolly_scalajs_react_CtorType$Mod$.prototype.constructor = $c_Ljapgolly_scalajs_react_CtorType$Mod$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_CtorType$Mod$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_CtorType$Mod$.prototype = $c_Ljapgolly_scalajs_react_CtorType$Mod$.prototype;
$c_Ljapgolly_scalajs_react_CtorType$Mod$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_CtorType$Mod$.prototype.productElement$extension__F1__I__O = (function($$this, x$1) {
  switch (x$1) {
    case 0: {
      return $$this;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Ljapgolly_scalajs_react_CtorType$Mod$.prototype.apply__O__O = (function(v1) {
  var mod = $as_F1(v1);
  return new $c_Ljapgolly_scalajs_react_CtorType$Mod().init___F1(mod)
});
$c_Ljapgolly_scalajs_react_CtorType$Mod$.prototype.productIterator$extension__F1__sc_Iterator = (function($$this) {
  var x = new $c_Ljapgolly_scalajs_react_CtorType$Mod().init___F1($$this);
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(x)
});
$c_Ljapgolly_scalajs_react_CtorType$Mod$.prototype.toString__T = (function() {
  return "Mod"
});
$c_Ljapgolly_scalajs_react_CtorType$Mod$.prototype.toString$extension__F1__T = (function($$this) {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(new $c_Ljapgolly_scalajs_react_CtorType$Mod().init___F1($$this))
});
$c_Ljapgolly_scalajs_react_CtorType$Mod$.prototype.apply$extension__F1__sjs_js_Object__sjs_js_Object = (function($$this, o) {
  $$this.apply__O__O(o);
  return o
});
$c_Ljapgolly_scalajs_react_CtorType$Mod$.prototype.equals$extension__F1__O__Z = (function($$this, x$1) {
  if ($is_Ljapgolly_scalajs_react_CtorType$Mod(x$1)) {
    var Mod$1 = ((x$1 === null) ? null : $as_Ljapgolly_scalajs_react_CtorType$Mod(x$1).mod$1);
    return (($$this === null) ? (Mod$1 === null) : $$this.equals__O__Z(Mod$1))
  } else {
    return false
  }
});
var $d_Ljapgolly_scalajs_react_CtorType$Mod$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_CtorType$Mod$: 0
}, false, "japgolly.scalajs.react.CtorType$Mod$", {
  Ljapgolly_scalajs_react_CtorType$Mod$: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_CtorType$Mod$.prototype.$classData = $d_Ljapgolly_scalajs_react_CtorType$Mod$;
var $n_Ljapgolly_scalajs_react_CtorType$Mod$ = (void 0);
function $m_Ljapgolly_scalajs_react_CtorType$Mod$() {
  if ((!$n_Ljapgolly_scalajs_react_CtorType$Mod$)) {
    $n_Ljapgolly_scalajs_react_CtorType$Mod$ = new $c_Ljapgolly_scalajs_react_CtorType$Mod$().init___()
  };
  return $n_Ljapgolly_scalajs_react_CtorType$Mod$
}
function $is_Ljapgolly_scalajs_react_component_Js$MountedWithRoot(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_component_Js$MountedWithRoot)))
}
function $as_Ljapgolly_scalajs_react_component_Js$MountedWithRoot(obj) {
  return (($is_Ljapgolly_scalajs_react_component_Js$MountedWithRoot(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.component.Js$MountedWithRoot"))
}
function $isArrayOf_Ljapgolly_scalajs_react_component_Js$MountedWithRoot(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_component_Js$MountedWithRoot)))
}
function $asArrayOf_Ljapgolly_scalajs_react_component_Js$MountedWithRoot(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_component_Js$MountedWithRoot(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.component.Js$MountedWithRoot;", depth))
}
function $is_Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_component_Scala$MountedWithRoot)))
}
function $as_Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(obj) {
  return (($is_Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.component.Scala$MountedWithRoot"))
}
function $isArrayOf_Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_component_Scala$MountedWithRoot)))
}
function $asArrayOf_Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.component.Scala$MountedWithRoot;", depth))
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle() {
  $c_O.call(this);
  this.componentDidMount$1 = null;
  this.componentDidUpdate$1 = null;
  this.componentWillMount$1 = null;
  this.componentWillReceiveProps$1 = null;
  this.componentWillUnmount$1 = null;
  this.componentWillUpdate$1 = null;
  this.shouldComponentUpdate$1 = null
}
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle.prototype.constructor = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle.prototype = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle.prototype;
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle.prototype.productPrefix__T = (function() {
  return "Lifecycle"
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle.prototype.productArity__I = (function() {
  return 7
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle(x$1)) {
    var Lifecycle$1 = $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle(x$1);
    var x = this.componentDidMount$1;
    var x$2 = Lifecycle$1.componentDidMount$1;
    if (((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))) {
      var x$3 = this.componentDidUpdate$1;
      var x$4 = Lifecycle$1.componentDidUpdate$1;
      var jsx$5 = ((x$3 === null) ? (x$4 === null) : x$3.equals__O__Z(x$4))
    } else {
      var jsx$5 = false
    };
    if (jsx$5) {
      var x$5 = this.componentWillMount$1;
      var x$6 = Lifecycle$1.componentWillMount$1;
      var jsx$4 = ((x$5 === null) ? (x$6 === null) : x$5.equals__O__Z(x$6))
    } else {
      var jsx$4 = false
    };
    if (jsx$4) {
      var x$7 = this.componentWillReceiveProps$1;
      var x$8 = Lifecycle$1.componentWillReceiveProps$1;
      var jsx$3 = ((x$7 === null) ? (x$8 === null) : x$7.equals__O__Z(x$8))
    } else {
      var jsx$3 = false
    };
    if (jsx$3) {
      var x$9 = this.componentWillUnmount$1;
      var x$10 = Lifecycle$1.componentWillUnmount$1;
      var jsx$2 = ((x$9 === null) ? (x$10 === null) : x$9.equals__O__Z(x$10))
    } else {
      var jsx$2 = false
    };
    if (jsx$2) {
      var x$11 = this.componentWillUpdate$1;
      var x$12 = Lifecycle$1.componentWillUpdate$1;
      var jsx$1 = ((x$11 === null) ? (x$12 === null) : x$11.equals__O__Z(x$12))
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      var x$13 = this.shouldComponentUpdate$1;
      var x$14 = Lifecycle$1.shouldComponentUpdate$1;
      return ((x$13 === null) ? (x$14 === null) : x$13.equals__O__Z(x$14))
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle.prototype.append__Ljapgolly_scalajs_react_internal_Lens__F1__F2__Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle = (function(lens, g, s) {
  return $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle($as_F1(lens.mod$1.apply__O__O(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, g$1, s$1) {
    return (function(o$2) {
      var o = $as_s_Option(o$2);
      if (o.isEmpty__Z()) {
        var jsx$1 = g$1
      } else {
        var arg1 = o.get__O();
        var f = $as_F1(arg1);
        var jsx$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this$1, g$1$1, s$3, f$1) {
          return (function(i$2) {
            return s$3.apply__O__O__O(f$1.apply__O__O(i$2), new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this$2, g$1$2, i) {
              return (function() {
                return g$1$2.apply__O__O(i)
              })
            })($this$1, g$1$1, i$2)))
          })
        })($this, g$1, s$1, f))
      };
      return new $c_s_Some().init___O(jsx$1)
    })
  })(this, g, s)))).apply__O__O(this))
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.componentDidMount$1;
      break
    }
    case 1: {
      return this.componentDidUpdate$1;
      break
    }
    case 2: {
      return this.componentWillMount$1;
      break
    }
    case 3: {
      return this.componentWillReceiveProps$1;
      break
    }
    case 4: {
      return this.componentWillUnmount$1;
      break
    }
    case 5: {
      return this.componentWillUpdate$1;
      break
    }
    case 6: {
      return this.shouldComponentUpdate$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle.prototype.init___s_Option__s_Option__s_Option__s_Option__s_Option__s_Option__s_Option = (function(componentDidMount, componentDidUpdate, componentWillMount, componentWillReceiveProps, componentWillUnmount, componentWillUpdate, shouldComponentUpdate) {
  this.componentDidMount$1 = componentDidMount;
  this.componentDidUpdate$1 = componentDidUpdate;
  this.componentWillMount$1 = componentWillMount;
  this.componentWillReceiveProps$1 = componentWillReceiveProps;
  this.componentWillUnmount$1 = componentWillUnmount;
  this.componentWillUpdate$1 = componentWillUpdate;
  this.shouldComponentUpdate$1 = shouldComponentUpdate;
  return this
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle)))
}
function $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle(obj) {
  return (($is_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.component.ScalaBuilder$Lifecycle"))
}
function $isArrayOf_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle)))
}
function $asArrayOf_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.component.ScalaBuilder$Lifecycle;", depth))
}
var $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle: 0
}, false, "japgolly.scalajs.react.component.ScalaBuilder$Lifecycle", {
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle.prototype.$classData = $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount() {
  $c_O.call(this);
  this.raw$1 = null
}
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount.prototype.constructor = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount.prototype = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount.prototype;
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount.prototype.raw__Ljapgolly_scalajs_react_raw_package$ReactComponent = (function() {
  return this.raw$1
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount.prototype.init___Ljapgolly_scalajs_react_raw_package$ReactComponent = (function(raw) {
  this.raw$1 = raw;
  return this
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount.prototype.equals__O__Z = (function(x$1) {
  return $m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount$().equals$extension__Ljapgolly_scalajs_react_raw_package$ReactComponent__O__Z(this.raw$1, x$1)
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount.prototype.toString__T = (function() {
  return $m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount$().toString$extension__Ljapgolly_scalajs_react_raw_package$ReactComponent__T(this.raw$1)
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount.prototype.hashCode__I = (function() {
  var $$this = this.raw$1;
  return $objectHashCode($$this)
});
function $is_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount)))
}
function $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount(obj) {
  return (($is_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.component.ScalaBuilder$Lifecycle$ComponentDidMount"))
}
function $isArrayOf_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount)))
}
function $asArrayOf_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.component.ScalaBuilder$Lifecycle$ComponentDidMount;", depth))
}
var $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount: 0
}, false, "japgolly.scalajs.react.component.ScalaBuilder$Lifecycle$ComponentDidMount", {
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$StateRW: 1,
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$StateW: 1,
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base: 1,
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ForceUpdate: 1
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount.prototype.$classData = $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentDidMount;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillReceiveProps() {
  $c_O.call(this);
  this.raw$1 = null;
  this.nextProps$1 = null
}
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillReceiveProps.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillReceiveProps.prototype.constructor = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillReceiveProps;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillReceiveProps() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillReceiveProps.prototype = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillReceiveProps.prototype;
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillReceiveProps.prototype.raw__Ljapgolly_scalajs_react_raw_package$ReactComponent = (function() {
  return this.raw$1
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillReceiveProps.prototype.toString__T = (function() {
  return $m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$().japgolly$scalajs$react$component$ScalaBuilder$Lifecycle$$wrapTostring__T__T(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["ComponentWillReceiveProps(props: ", " \u2192 ", ", state: ", ")"])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([$f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this).props__O(), this.nextProps$1, $f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this).state__O()])))
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillReceiveProps.prototype.init___Ljapgolly_scalajs_react_raw_package$ReactComponent__O = (function(raw, nextProps) {
  this.raw$1 = raw;
  this.nextProps$1 = nextProps;
  return this
});
var $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillReceiveProps = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillReceiveProps: 0
}, false, "japgolly.scalajs.react.component.ScalaBuilder$Lifecycle$ComponentWillReceiveProps", {
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillReceiveProps: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$StateRW: 1,
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$StateW: 1,
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base: 1,
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ForceUpdate: 1
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillReceiveProps.prototype.$classData = $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ComponentWillReceiveProps;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$RenderScope() {
  $c_O.call(this);
  this.raw$1 = null
}
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$RenderScope.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$RenderScope.prototype.constructor = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$RenderScope;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$RenderScope() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$RenderScope.prototype = $c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$RenderScope.prototype;
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$RenderScope.prototype.raw__Ljapgolly_scalajs_react_raw_package$ReactComponent = (function() {
  return this.raw$1
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$RenderScope.prototype.init___Ljapgolly_scalajs_react_raw_package$ReactComponent = (function(raw) {
  this.raw$1 = raw;
  return this
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$RenderScope.prototype.toString__T = (function() {
  return $m_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$().japgolly$scalajs$react$component$ScalaBuilder$Lifecycle$$wrapTostring__T__T(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["Render(props: ", ", state: ", ")"])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([$f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this).props__O(), $f_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base__mountedImpure__Ljapgolly_scalajs_react_component_Scala$MountedWithRoot(this).state__O()])))
});
function $is_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$RenderScope(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$RenderScope)))
}
function $as_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$RenderScope(obj) {
  return (($is_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$RenderScope(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.component.ScalaBuilder$Lifecycle$RenderScope"))
}
function $isArrayOf_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$RenderScope(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$RenderScope)))
}
function $asArrayOf_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$RenderScope(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$RenderScope(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.component.ScalaBuilder$Lifecycle$RenderScope;", depth))
}
var $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$RenderScope = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$RenderScope: 0
}, false, "japgolly.scalajs.react.component.ScalaBuilder$Lifecycle$RenderScope", {
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$RenderScope: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$StateRW: 1,
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$StateW: 1,
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$Base: 1,
  Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$ForceUpdate: 1
});
$c_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$RenderScope.prototype.$classData = $d_Ljapgolly_scalajs_react_component_ScalaBuilder$Lifecycle$RenderScope;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_Template$MountedMapped() {
  $c_O.call(this);
  this.from$1 = null;
  this.mp$1 = null;
  this.ls$1 = null;
  this.ft$1 = null
}
$c_Ljapgolly_scalajs_react_component_Template$MountedMapped.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_Template$MountedMapped.prototype.constructor = $c_Ljapgolly_scalajs_react_component_Template$MountedMapped;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_Template$MountedMapped() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_Template$MountedMapped.prototype = $c_Ljapgolly_scalajs_react_component_Template$MountedMapped.prototype;
$c_Ljapgolly_scalajs_react_component_Template$MountedMapped.prototype.props__O = (function() {
  return this.ft$1.apply__F0__O(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
    return (function() {
      return $this.mp$1.apply__O__O($this.from$1.props__O())
    })
  })(this)))
});
$c_Ljapgolly_scalajs_react_component_Template$MountedMapped.prototype.modState__F1__F0__O = (function(f, callback) {
  return this.ft$1.apply__F0__O(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, f$1, callback$1) {
    return (function() {
      $this.from$1.modState__F1__F0__O($as_F1($this.ls$1.mod$1.apply__O__O(f$1)), callback$1)
    })
  })(this, f, callback)))
});
$c_Ljapgolly_scalajs_react_component_Template$MountedMapped.prototype.setState__O__F0__O = (function(s, callback) {
  return this.ft$1.apply__F0__O(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, s$1, callback$1) {
    return (function() {
      $this.from$1.modState__F1__F0__O($as_F1($this.ls$1.set$1.apply__O__O(s$1)), callback$1)
    })
  })(this, s, callback)))
});
$c_Ljapgolly_scalajs_react_component_Template$MountedMapped.prototype.init___Ljapgolly_scalajs_react_component_Generic$MountedWithRoot__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans = (function(from, mp, ls, ft) {
  this.from$1 = from;
  this.mp$1 = mp;
  this.ls$1 = ls;
  this.ft$1 = ft;
  return this
});
$c_Ljapgolly_scalajs_react_component_Template$MountedMapped.prototype.state__O = (function() {
  return this.ft$1.apply__F0__O(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
    return (function() {
      return $this.ls$1.get$1.apply__O__O($this.from$1.state__O())
    })
  })(this)))
});
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_Template$MountedWithRoot() {
  $c_O.call(this);
  this.ft$1 = null
}
$c_Ljapgolly_scalajs_react_component_Template$MountedWithRoot.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_Template$MountedWithRoot.prototype.constructor = $c_Ljapgolly_scalajs_react_component_Template$MountedWithRoot;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_Template$MountedWithRoot() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_Template$MountedWithRoot.prototype = $c_Ljapgolly_scalajs_react_component_Template$MountedWithRoot.prototype;
$c_Ljapgolly_scalajs_react_component_Template$MountedWithRoot.prototype.withEffect__Ljapgolly_scalajs_react_internal_Effect$Trans__Ljapgolly_scalajs_react_component_Generic$MountedWithRoot = (function(t) {
  var jsx$1 = $m_Ljapgolly_scalajs_react_internal_package$().identityFnInstance$1;
  var this$1 = $m_Ljapgolly_scalajs_react_internal_Lens$();
  return this.mapped__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans__Ljapgolly_scalajs_react_component_Generic$MountedWithRoot(jsx$1, this$1.idInstance$1, this.ft$1.compose__Ljapgolly_scalajs_react_internal_Effect$Trans__s_Predef$$less$colon$less__Ljapgolly_scalajs_react_internal_Effect$Trans(t, null))
});
$c_Ljapgolly_scalajs_react_component_Template$MountedWithRoot.prototype.init___Ljapgolly_scalajs_react_internal_Effect$Trans = (function(ft) {
  this.ft$1 = ft;
  return this
});
function $is_Ljapgolly_scalajs_react_extra_router_Redirect(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_extra_router_Redirect)))
}
function $as_Ljapgolly_scalajs_react_extra_router_Redirect(obj) {
  return (($is_Ljapgolly_scalajs_react_extra_router_Redirect(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.extra.router.Redirect"))
}
function $isArrayOf_Ljapgolly_scalajs_react_extra_router_Redirect(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_extra_router_Redirect)))
}
function $asArrayOf_Ljapgolly_scalajs_react_extra_router_Redirect(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_extra_router_Redirect(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.extra.router.Redirect;", depth))
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_Resolution() {
  $c_O.call(this);
  this.page$1 = null;
  this.render$1 = null
}
$c_Ljapgolly_scalajs_react_extra_router_Resolution.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_router_Resolution.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_Resolution;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_Resolution() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_Resolution.prototype = $c_Ljapgolly_scalajs_react_extra_router_Resolution.prototype;
$c_Ljapgolly_scalajs_react_extra_router_Resolution.prototype.productPrefix__T = (function() {
  return "Resolution"
});
$c_Ljapgolly_scalajs_react_extra_router_Resolution.prototype.productArity__I = (function() {
  return 2
});
$c_Ljapgolly_scalajs_react_extra_router_Resolution.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Ljapgolly_scalajs_react_extra_router_Resolution(x$1)) {
    var Resolution$1 = $as_Ljapgolly_scalajs_react_extra_router_Resolution(x$1);
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(this.page$1, Resolution$1.page$1)) {
      var x = this.render$1;
      var x$2 = Resolution$1.render$1;
      return (x === x$2)
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_extra_router_Resolution.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.page$1;
      break
    }
    case 1: {
      return this.render$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Ljapgolly_scalajs_react_extra_router_Resolution.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Ljapgolly_scalajs_react_extra_router_Resolution.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Ljapgolly_scalajs_react_extra_router_Resolution.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Ljapgolly_scalajs_react_extra_router_Resolution.prototype.init___O__F0 = (function(page, render) {
  this.page$1 = page;
  this.render$1 = render;
  return this
});
function $is_Ljapgolly_scalajs_react_extra_router_Resolution(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_extra_router_Resolution)))
}
function $as_Ljapgolly_scalajs_react_extra_router_Resolution(obj) {
  return (($is_Ljapgolly_scalajs_react_extra_router_Resolution(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.extra.router.Resolution"))
}
function $isArrayOf_Ljapgolly_scalajs_react_extra_router_Resolution(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_extra_router_Resolution)))
}
function $asArrayOf_Ljapgolly_scalajs_react_extra_router_Resolution(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_extra_router_Resolution(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.extra.router.Resolution;", depth))
}
var $d_Ljapgolly_scalajs_react_extra_router_Resolution = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_Resolution: 0
}, false, "japgolly.scalajs.react.extra.router.Resolution", {
  Ljapgolly_scalajs_react_extra_router_Resolution: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_extra_router_Resolution.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_Resolution;
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_RouterConfig() {
  $c_O.call(this);
  this.parse$1 = null;
  this.path$1 = null;
  this.action$1 = null;
  this.renderFn$1 = null;
  this.postRenderFn$1 = null;
  this.logger$1 = null
}
$c_Ljapgolly_scalajs_react_extra_router_RouterConfig.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_router_RouterConfig.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_RouterConfig;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_RouterConfig() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_RouterConfig.prototype = $c_Ljapgolly_scalajs_react_extra_router_RouterConfig.prototype;
$c_Ljapgolly_scalajs_react_extra_router_RouterConfig.prototype.productPrefix__T = (function() {
  return "RouterConfig"
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfig.prototype.productArity__I = (function() {
  return 6
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfig.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Ljapgolly_scalajs_react_extra_router_RouterConfig(x$1)) {
    var RouterConfig$1 = $as_Ljapgolly_scalajs_react_extra_router_RouterConfig(x$1);
    var x = this.parse$1;
    var x$2 = RouterConfig$1.parse$1;
    if (((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))) {
      var x$3 = this.path$1;
      var x$4 = RouterConfig$1.path$1;
      var jsx$4 = ((x$3 === null) ? (x$4 === null) : x$3.equals__O__Z(x$4))
    } else {
      var jsx$4 = false
    };
    if (jsx$4) {
      var x$5 = this.action$1;
      var x$6 = RouterConfig$1.action$1;
      var jsx$3 = (x$5 === x$6)
    } else {
      var jsx$3 = false
    };
    if (jsx$3) {
      var x$7 = this.renderFn$1;
      var x$8 = RouterConfig$1.renderFn$1;
      var jsx$2 = (x$7 === x$8)
    } else {
      var jsx$2 = false
    };
    if (jsx$2) {
      var x$9 = this.postRenderFn$1;
      var x$10 = RouterConfig$1.postRenderFn$1;
      var jsx$1 = (x$9 === x$10)
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      var x$11 = this.logger$1;
      var x$12 = RouterConfig$1.logger$1;
      return ((x$11 === null) ? (x$12 === null) : x$11.equals__O__Z(x$12))
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfig.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.parse$1;
      break
    }
    case 1: {
      return this.path$1;
      break
    }
    case 2: {
      return this.action$1;
      break
    }
    case 3: {
      return this.renderFn$1;
      break
    }
    case 4: {
      return this.postRenderFn$1;
      break
    }
    case 5: {
      return this.logger$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfig.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfig.prototype.init___F1__F1__F2__F2__F2__F1 = (function(parse, path, action, renderFn, postRenderFn, logger) {
  this.parse$1 = parse;
  this.path$1 = path;
  this.action$1 = action;
  this.renderFn$1 = renderFn;
  this.postRenderFn$1 = postRenderFn;
  this.logger$1 = logger;
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfig.prototype.renderWith__F2__Ljapgolly_scalajs_react_extra_router_RouterConfig = (function(f) {
  var x$18 = this.parse$1;
  var x$19 = this.path$1;
  var x$20 = this.action$1;
  var x$21 = this.postRenderFn$1;
  var x$22 = this.logger$1;
  return new $c_Ljapgolly_scalajs_react_extra_router_RouterConfig().init___F1__F1__F2__F2__F2__F1(x$18, x$19, x$20, f, x$21, x$22)
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfig.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfig.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Ljapgolly_scalajs_react_extra_router_RouterConfig(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_extra_router_RouterConfig)))
}
function $as_Ljapgolly_scalajs_react_extra_router_RouterConfig(obj) {
  return (($is_Ljapgolly_scalajs_react_extra_router_RouterConfig(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.extra.router.RouterConfig"))
}
function $isArrayOf_Ljapgolly_scalajs_react_extra_router_RouterConfig(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_extra_router_RouterConfig)))
}
function $asArrayOf_Ljapgolly_scalajs_react_extra_router_RouterConfig(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_extra_router_RouterConfig(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.extra.router.RouterConfig;", depth))
}
var $d_Ljapgolly_scalajs_react_extra_router_RouterConfig = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_RouterConfig: 0
}, false, "japgolly.scalajs.react.extra.router.RouterConfig", {
  Ljapgolly_scalajs_react_extra_router_RouterConfig: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfig.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_RouterConfig;
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule() {
  $c_O.call(this);
  this.parse$1 = null;
  this.path$1 = null;
  this.action$1 = null
}
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule.prototype = $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule.prototype;
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule.prototype.init___F1__F1__F2 = (function(parse, path, action) {
  this.parse$1 = parse;
  this.path$1 = path;
  this.action$1 = action;
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule.prototype.productPrefix__T = (function() {
  return "Rule"
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule.prototype.productArity__I = (function() {
  return 3
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule(x$1)) {
    var Rule$1 = $as_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule(x$1);
    var x = this.parse$1;
    var x$2 = Rule$1.parse$1;
    if (((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))) {
      var x$3 = this.path$1;
      var x$4 = Rule$1.path$1;
      var jsx$1 = ((x$3 === null) ? (x$4 === null) : x$3.equals__O__Z(x$4))
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      var x$5 = this.action$1;
      var x$6 = Rule$1.action$1;
      return (x$5 === x$6)
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.parse$1;
      break
    }
    case 1: {
      return this.path$1;
      break
    }
    case 2: {
      return this.action$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule.prototype.noFallback__Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules = (function() {
  return this.fallback__F1__F2__Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(page$2) {
      $m_s_sys_package$().error__T__sr_Nothing$(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["Unspecified path for page ", "."])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([page$2])))
    })
  })(this)), new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function(this$2) {
    return (function(path$2, page$3$2) {
      var path = $as_Ljapgolly_scalajs_react_extra_router_Path(path$2);
      $m_s_sys_package$().error__T__sr_Nothing$(new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["Unspecified action for page ", " at ", "."])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([page$3$2, path])))
    })
  })(this)))
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule.prototype.fallback__F1__F2__Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules = (function(fp, fa) {
  var jsx$4 = this.parse$1;
  var jsx$3 = $m_Ljapgolly_scalajs_react_extra_router_package$OptionFnExt$();
  var f = this.path$1;
  var jsx$2 = jsx$3.$$bar$extension__F1__F1__F1(f, fp);
  var jsx$1 = $m_Ljapgolly_scalajs_react_extra_router_package$OptionFn2Ext$();
  var f$1 = this.action$1;
  return new $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules().init___F1__F1__F2(jsx$4, jsx$2, jsx$1.$$bar$extension__F2__F2__F2(f$1, fa))
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule.prototype.$$bar__Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule__Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule = (function(that) {
  var jsx$3 = $m_Ljapgolly_scalajs_react_extra_router_package$OptionFnExt$();
  var f = this.parse$1;
  var jsx$2 = jsx$3.$$bar$bar$extension__F1__F1__F1(f, that.parse$1);
  var jsx$1 = $m_Ljapgolly_scalajs_react_extra_router_package$OptionFnExt$();
  var f$1 = this.path$1;
  return new $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule().init___F1__F1__F2(jsx$2, jsx$1.$$bar$bar$extension__F1__F1__F1(f$1, that.path$1), new $c_sjsr_AnonFunction2().init___sjs_js_Function2((function($this, that$1) {
    return (function(u$2, p$2) {
      var u = $as_Ljapgolly_scalajs_react_extra_router_Path(u$2);
      return $as_s_Option(($as_s_Option($this.path$1.apply__O__O(p$2)).isDefined__Z() ? $this.action$1 : that$1.action$1).apply__O__O__O(u, p$2))
    })
  })(this, that)))
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule)))
}
function $as_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule(obj) {
  return (($is_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.extra.router.StaticDsl$Rule"))
}
function $isArrayOf_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule)))
}
function $asArrayOf_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.extra.router.StaticDsl$Rule;", depth))
}
var $d_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule: 0
}, false, "japgolly.scalajs.react.extra.router.StaticDsl$Rule", {
  Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rule;
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules() {
  $c_O.call(this);
  this.parse$1 = null;
  this.path$1 = null;
  this.action$1 = null
}
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules.prototype = $c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules.prototype;
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules.prototype.init___F1__F1__F2 = (function(parse, path, action) {
  this.parse$1 = parse;
  this.path$1 = path;
  this.action$1 = action;
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules.prototype.productPrefix__T = (function() {
  return "Rules"
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules.prototype.productArity__I = (function() {
  return 3
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules(x$1)) {
    var Rules$1 = $as_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules(x$1);
    var x = this.parse$1;
    var x$2 = Rules$1.parse$1;
    if (((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))) {
      var x$3 = this.path$1;
      var x$4 = Rules$1.path$1;
      var jsx$1 = ((x$3 === null) ? (x$4 === null) : x$3.equals__O__Z(x$4))
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      var x$5 = this.action$1;
      var x$6 = Rules$1.action$1;
      return (x$5 === x$6)
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.parse$1;
      break
    }
    case 1: {
      return this.path$1;
      break
    }
    case 2: {
      return this.action$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules.prototype.notFound__F1__Ljapgolly_scalajs_react_extra_router_RouterConfig = (function(f) {
  var this$2 = $m_Ljapgolly_scalajs_react_extra_router_RouterConfig$();
  var jsx$1 = $m_Ljapgolly_scalajs_react_extra_router_package$OptionFnExt$();
  var f$1 = this.parse$1;
  var parse = jsx$1.$$bar$extension__F1__F1__F1(f$1, f);
  var path = this.path$1;
  var action = this.action$1;
  return new $c_Ljapgolly_scalajs_react_extra_router_RouterConfig().init___F1__F1__F2__F2__F2__F1(parse, path, action, this$2.defaultRenderFn__F2(), this$2.defaultPostRenderFn__F2(), this$2.nopLogger$1)
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules)))
}
function $as_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules(obj) {
  return (($is_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.extra.router.StaticDsl$Rules"))
}
function $isArrayOf_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules)))
}
function $asArrayOf_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.extra.router.StaticDsl$Rules;", depth))
}
var $d_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules: 0
}, false, "japgolly.scalajs.react.extra.router.StaticDsl$Rules", {
  Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_StaticDsl$Rules;
/** @constructor */
function $c_jl_ArithmeticException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_ArithmeticException.prototype = new $h_jl_RuntimeException();
$c_jl_ArithmeticException.prototype.constructor = $c_jl_ArithmeticException;
/** @constructor */
function $h_jl_ArithmeticException() {
  /*<skip>*/
}
$h_jl_ArithmeticException.prototype = $c_jl_ArithmeticException.prototype;
$c_jl_ArithmeticException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_ArithmeticException = new $TypeData().initClass({
  jl_ArithmeticException: 0
}, false, "java.lang.ArithmeticException", {
  jl_ArithmeticException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_ArithmeticException.prototype.$classData = $d_jl_ArithmeticException;
/** @constructor */
function $c_jl_ClassCastException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_ClassCastException.prototype = new $h_jl_RuntimeException();
$c_jl_ClassCastException.prototype.constructor = $c_jl_ClassCastException;
/** @constructor */
function $h_jl_ClassCastException() {
  /*<skip>*/
}
$h_jl_ClassCastException.prototype = $c_jl_ClassCastException.prototype;
$c_jl_ClassCastException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
function $is_jl_ClassCastException(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_ClassCastException)))
}
function $as_jl_ClassCastException(obj) {
  return (($is_jl_ClassCastException(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.ClassCastException"))
}
function $isArrayOf_jl_ClassCastException(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_ClassCastException)))
}
function $asArrayOf_jl_ClassCastException(obj, depth) {
  return (($isArrayOf_jl_ClassCastException(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.ClassCastException;", depth))
}
var $d_jl_ClassCastException = new $TypeData().initClass({
  jl_ClassCastException: 0
}, false, "java.lang.ClassCastException", {
  jl_ClassCastException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_ClassCastException.prototype.$classData = $d_jl_ClassCastException;
/** @constructor */
function $c_jl_IllegalArgumentException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_IllegalArgumentException.prototype = new $h_jl_RuntimeException();
$c_jl_IllegalArgumentException.prototype.constructor = $c_jl_IllegalArgumentException;
/** @constructor */
function $h_jl_IllegalArgumentException() {
  /*<skip>*/
}
$h_jl_IllegalArgumentException.prototype = $c_jl_IllegalArgumentException.prototype;
$c_jl_IllegalArgumentException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
$c_jl_IllegalArgumentException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_IllegalArgumentException = new $TypeData().initClass({
  jl_IllegalArgumentException: 0
}, false, "java.lang.IllegalArgumentException", {
  jl_IllegalArgumentException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_IllegalArgumentException.prototype.$classData = $d_jl_IllegalArgumentException;
/** @constructor */
function $c_jl_IllegalStateException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_IllegalStateException.prototype = new $h_jl_RuntimeException();
$c_jl_IllegalStateException.prototype.constructor = $c_jl_IllegalStateException;
/** @constructor */
function $h_jl_IllegalStateException() {
  /*<skip>*/
}
$h_jl_IllegalStateException.prototype = $c_jl_IllegalStateException.prototype;
$c_jl_IllegalStateException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_IllegalStateException = new $TypeData().initClass({
  jl_IllegalStateException: 0
}, false, "java.lang.IllegalStateException", {
  jl_IllegalStateException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_IllegalStateException.prototype.$classData = $d_jl_IllegalStateException;
/** @constructor */
function $c_jl_IndexOutOfBoundsException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_IndexOutOfBoundsException.prototype = new $h_jl_RuntimeException();
$c_jl_IndexOutOfBoundsException.prototype.constructor = $c_jl_IndexOutOfBoundsException;
/** @constructor */
function $h_jl_IndexOutOfBoundsException() {
  /*<skip>*/
}
$h_jl_IndexOutOfBoundsException.prototype = $c_jl_IndexOutOfBoundsException.prototype;
$c_jl_IndexOutOfBoundsException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_IndexOutOfBoundsException = new $TypeData().initClass({
  jl_IndexOutOfBoundsException: 0
}, false, "java.lang.IndexOutOfBoundsException", {
  jl_IndexOutOfBoundsException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_IndexOutOfBoundsException.prototype.$classData = $d_jl_IndexOutOfBoundsException;
/** @constructor */
function $c_jl_NullPointerException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_NullPointerException.prototype = new $h_jl_RuntimeException();
$c_jl_NullPointerException.prototype.constructor = $c_jl_NullPointerException;
/** @constructor */
function $h_jl_NullPointerException() {
  /*<skip>*/
}
$h_jl_NullPointerException.prototype = $c_jl_NullPointerException.prototype;
$c_jl_NullPointerException.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
var $d_jl_NullPointerException = new $TypeData().initClass({
  jl_NullPointerException: 0
}, false, "java.lang.NullPointerException", {
  jl_NullPointerException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_NullPointerException.prototype.$classData = $d_jl_NullPointerException;
/** @constructor */
function $c_jl_UnsupportedOperationException() {
  $c_jl_RuntimeException.call(this)
}
$c_jl_UnsupportedOperationException.prototype = new $h_jl_RuntimeException();
$c_jl_UnsupportedOperationException.prototype.constructor = $c_jl_UnsupportedOperationException;
/** @constructor */
function $h_jl_UnsupportedOperationException() {
  /*<skip>*/
}
$h_jl_UnsupportedOperationException.prototype = $c_jl_UnsupportedOperationException.prototype;
$c_jl_UnsupportedOperationException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_UnsupportedOperationException = new $TypeData().initClass({
  jl_UnsupportedOperationException: 0
}, false, "java.lang.UnsupportedOperationException", {
  jl_UnsupportedOperationException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_UnsupportedOperationException.prototype.$classData = $d_jl_UnsupportedOperationException;
/** @constructor */
function $c_ju_NoSuchElementException() {
  $c_jl_RuntimeException.call(this)
}
$c_ju_NoSuchElementException.prototype = new $h_jl_RuntimeException();
$c_ju_NoSuchElementException.prototype.constructor = $c_ju_NoSuchElementException;
/** @constructor */
function $h_ju_NoSuchElementException() {
  /*<skip>*/
}
$h_ju_NoSuchElementException.prototype = $c_ju_NoSuchElementException.prototype;
$c_ju_NoSuchElementException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_ju_NoSuchElementException = new $TypeData().initClass({
  ju_NoSuchElementException: 0
}, false, "java.util.NoSuchElementException", {
  ju_NoSuchElementException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_ju_NoSuchElementException.prototype.$classData = $d_ju_NoSuchElementException;
/** @constructor */
function $c_s_MatchError() {
  $c_jl_RuntimeException.call(this);
  this.objString$4 = null;
  this.obj$4 = null;
  this.bitmap$0$4 = false
}
$c_s_MatchError.prototype = new $h_jl_RuntimeException();
$c_s_MatchError.prototype.constructor = $c_s_MatchError;
/** @constructor */
function $h_s_MatchError() {
  /*<skip>*/
}
$h_s_MatchError.prototype = $c_s_MatchError.prototype;
$c_s_MatchError.prototype.objString$lzycompute__p4__T = (function() {
  if ((!this.bitmap$0$4)) {
    this.objString$4 = ((this.obj$4 === null) ? "null" : this.liftedTree1$1__p4__T());
    this.bitmap$0$4 = true
  };
  return this.objString$4
});
$c_s_MatchError.prototype.ofClass$1__p4__T = (function() {
  var this$1 = this.obj$4;
  return ("of class " + $objectGetClass(this$1).getName__T())
});
$c_s_MatchError.prototype.liftedTree1$1__p4__T = (function() {
  try {
    return ((($objectToString(this.obj$4) + " (") + this.ofClass$1__p4__T()) + ")")
  } catch (e) {
    var e$2 = $m_sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      return ("an instance " + this.ofClass$1__p4__T())
    } else {
      throw e
    }
  }
});
$c_s_MatchError.prototype.getMessage__T = (function() {
  return this.objString__p4__T()
});
$c_s_MatchError.prototype.objString__p4__T = (function() {
  return ((!this.bitmap$0$4) ? this.objString$lzycompute__p4__T() : this.objString$4)
});
$c_s_MatchError.prototype.init___O = (function(obj) {
  this.obj$4 = obj;
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
var $d_s_MatchError = new $TypeData().initClass({
  s_MatchError: 0
}, false, "scala.MatchError", {
  s_MatchError: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_s_MatchError.prototype.$classData = $d_s_MatchError;
/** @constructor */
function $c_s_Option() {
  $c_O.call(this)
}
$c_s_Option.prototype = new $h_O();
$c_s_Option.prototype.constructor = $c_s_Option;
/** @constructor */
function $h_s_Option() {
  /*<skip>*/
}
$h_s_Option.prototype = $c_s_Option.prototype;
$c_s_Option.prototype.isDefined__Z = (function() {
  return (!this.isEmpty__Z())
});
function $is_s_Option(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_Option)))
}
function $as_s_Option(obj) {
  return (($is_s_Option(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Option"))
}
function $isArrayOf_s_Option(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_Option)))
}
function $asArrayOf_s_Option(obj, depth) {
  return (($isArrayOf_s_Option(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Option;", depth))
}
/** @constructor */
function $c_s_PartialFunction$$anon$1() {
  $c_O.call(this);
  this.lift$1 = null
}
$c_s_PartialFunction$$anon$1.prototype = new $h_O();
$c_s_PartialFunction$$anon$1.prototype.constructor = $c_s_PartialFunction$$anon$1;
/** @constructor */
function $h_s_PartialFunction$$anon$1() {
  /*<skip>*/
}
$h_s_PartialFunction$$anon$1.prototype = $c_s_PartialFunction$$anon$1.prototype;
$c_s_PartialFunction$$anon$1.prototype.init___ = (function() {
  this.lift$1 = new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$2) {
      return $m_s_None$()
    })
  })(this));
  return this
});
$c_s_PartialFunction$$anon$1.prototype.apply__O__O = (function(v1) {
  this.apply__O__sr_Nothing$(v1)
});
$c_s_PartialFunction$$anon$1.prototype.toString__T = (function() {
  return "<function1>"
});
$c_s_PartialFunction$$anon$1.prototype.isDefinedAt__O__Z = (function(x) {
  return false
});
$c_s_PartialFunction$$anon$1.prototype.applyOrElse__O__F1__O = (function(x, $default) {
  return $f_s_PartialFunction__applyOrElse__O__F1__O(this, x, $default)
});
$c_s_PartialFunction$$anon$1.prototype.apply__O__sr_Nothing$ = (function(x) {
  throw new $c_s_MatchError().init___O(x)
});
$c_s_PartialFunction$$anon$1.prototype.andThen__F1__F1 = (function(g) {
  return this
});
var $d_s_PartialFunction$$anon$1 = new $TypeData().initClass({
  s_PartialFunction$$anon$1: 0
}, false, "scala.PartialFunction$$anon$1", {
  s_PartialFunction$$anon$1: 1,
  O: 1,
  s_PartialFunction: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_PartialFunction$$anon$1.prototype.$classData = $d_s_PartialFunction$$anon$1;
/** @constructor */
function $c_s_PartialFunction$AndThen() {
  $c_O.call(this);
  this.pf$1 = null;
  this.k$1 = null
}
$c_s_PartialFunction$AndThen.prototype = new $h_O();
$c_s_PartialFunction$AndThen.prototype.constructor = $c_s_PartialFunction$AndThen;
/** @constructor */
function $h_s_PartialFunction$AndThen() {
  /*<skip>*/
}
$h_s_PartialFunction$AndThen.prototype = $c_s_PartialFunction$AndThen.prototype;
$c_s_PartialFunction$AndThen.prototype.init___s_PartialFunction__F1 = (function(pf, k) {
  this.pf$1 = pf;
  this.k$1 = k;
  return this
});
$c_s_PartialFunction$AndThen.prototype.apply__O__O = (function(x) {
  return this.k$1.apply__O__O(this.pf$1.apply__O__O(x))
});
$c_s_PartialFunction$AndThen.prototype.toString__T = (function() {
  return "<function1>"
});
$c_s_PartialFunction$AndThen.prototype.isDefinedAt__O__Z = (function(x) {
  return this.pf$1.isDefinedAt__O__Z(x)
});
$c_s_PartialFunction$AndThen.prototype.applyOrElse__O__F1__O = (function(x, $default) {
  var z = this.pf$1.applyOrElse__O__F1__O(x, $m_s_PartialFunction$().scala$PartialFunction$$fallback$undpf$f);
  return ((!$m_s_PartialFunction$().scala$PartialFunction$$fallbackOccurred__O__Z(z)) ? this.k$1.apply__O__O(z) : $default.apply__O__O(x))
});
$c_s_PartialFunction$AndThen.prototype.andThen__F1__F1 = (function(g) {
  return new $c_s_PartialFunction$AndThen().init___s_PartialFunction__F1(this, g)
});
var $d_s_PartialFunction$AndThen = new $TypeData().initClass({
  s_PartialFunction$AndThen: 0
}, false, "scala.PartialFunction$AndThen", {
  s_PartialFunction$AndThen: 1,
  O: 1,
  s_PartialFunction: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_PartialFunction$AndThen.prototype.$classData = $d_s_PartialFunction$AndThen;
/** @constructor */
function $c_s_PartialFunction$Lifted() {
  $c_sr_AbstractFunction1.call(this);
  this.pf$2 = null
}
$c_s_PartialFunction$Lifted.prototype = new $h_sr_AbstractFunction1();
$c_s_PartialFunction$Lifted.prototype.constructor = $c_s_PartialFunction$Lifted;
/** @constructor */
function $h_s_PartialFunction$Lifted() {
  /*<skip>*/
}
$h_s_PartialFunction$Lifted.prototype = $c_s_PartialFunction$Lifted.prototype;
$c_s_PartialFunction$Lifted.prototype.apply__O__O = (function(v1) {
  return this.apply__O__s_Option(v1)
});
$c_s_PartialFunction$Lifted.prototype.init___s_PartialFunction = (function(pf) {
  this.pf$2 = pf;
  return this
});
$c_s_PartialFunction$Lifted.prototype.apply__O__s_Option = (function(x) {
  var z = this.pf$2.applyOrElse__O__F1__O(x, $m_s_PartialFunction$().scala$PartialFunction$$fallback$undpf$f);
  return ((!$m_s_PartialFunction$().scala$PartialFunction$$fallbackOccurred__O__Z(z)) ? new $c_s_Some().init___O(z) : $m_s_None$())
});
var $d_s_PartialFunction$Lifted = new $TypeData().initClass({
  s_PartialFunction$Lifted: 0
}, false, "scala.PartialFunction$Lifted", {
  s_PartialFunction$Lifted: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_PartialFunction$Lifted.prototype.$classData = $d_s_PartialFunction$Lifted;
/** @constructor */
function $c_s_Predef$$anon$1() {
  $c_s_Predef$$less$colon$less.call(this)
}
$c_s_Predef$$anon$1.prototype = new $h_s_Predef$$less$colon$less();
$c_s_Predef$$anon$1.prototype.constructor = $c_s_Predef$$anon$1;
/** @constructor */
function $h_s_Predef$$anon$1() {
  /*<skip>*/
}
$h_s_Predef$$anon$1.prototype = $c_s_Predef$$anon$1.prototype;
$c_s_Predef$$anon$1.prototype.init___ = (function() {
  return this
});
$c_s_Predef$$anon$1.prototype.apply__O__O = (function(x) {
  return x
});
var $d_s_Predef$$anon$1 = new $TypeData().initClass({
  s_Predef$$anon$1: 0
}, false, "scala.Predef$$anon$1", {
  s_Predef$$anon$1: 1,
  s_Predef$$less$colon$less: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Predef$$anon$1.prototype.$classData = $d_s_Predef$$anon$1;
/** @constructor */
function $c_s_Predef$$anon$2() {
  $c_s_Predef$$eq$colon$eq.call(this)
}
$c_s_Predef$$anon$2.prototype = new $h_s_Predef$$eq$colon$eq();
$c_s_Predef$$anon$2.prototype.constructor = $c_s_Predef$$anon$2;
/** @constructor */
function $h_s_Predef$$anon$2() {
  /*<skip>*/
}
$h_s_Predef$$anon$2.prototype = $c_s_Predef$$anon$2.prototype;
$c_s_Predef$$anon$2.prototype.init___ = (function() {
  return this
});
$c_s_Predef$$anon$2.prototype.apply__O__O = (function(x) {
  return x
});
var $d_s_Predef$$anon$2 = new $TypeData().initClass({
  s_Predef$$anon$2: 0
}, false, "scala.Predef$$anon$2", {
  s_Predef$$anon$2: 1,
  s_Predef$$eq$colon$eq: 1,
  O: 1,
  F1: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Predef$$anon$2.prototype.$classData = $d_s_Predef$$anon$2;
/** @constructor */
function $c_s_StringContext() {
  $c_O.call(this);
  this.parts$1 = null
}
$c_s_StringContext.prototype = new $h_O();
$c_s_StringContext.prototype.constructor = $c_s_StringContext;
/** @constructor */
function $h_s_StringContext() {
  /*<skip>*/
}
$h_s_StringContext.prototype = $c_s_StringContext.prototype;
$c_s_StringContext.prototype.productPrefix__T = (function() {
  return "StringContext"
});
$c_s_StringContext.prototype.productArity__I = (function() {
  return 1
});
$c_s_StringContext.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_s_StringContext(x$1)) {
    var StringContext$1 = $as_s_StringContext(x$1);
    var x = this.parts$1;
    var x$2 = StringContext$1.parts$1;
    return ((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))
  } else {
    return false
  }
});
$c_s_StringContext.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.parts$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_s_StringContext.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_s_StringContext.prototype.checkLengths__sc_Seq__V = (function(args) {
  if ((this.parts$1.length__I() !== ((1 + args.length__I()) | 0))) {
    throw new $c_jl_IllegalArgumentException().init___T((((("wrong number of arguments (" + args.length__I()) + ") for interpolated string with ") + this.parts$1.length__I()) + " parts"))
  }
});
$c_s_StringContext.prototype.s__sc_Seq__T = (function(args) {
  var f = (function($this) {
    return (function(str$2) {
      var str = $as_T(str$2);
      var this$1 = $m_s_StringContext$();
      return this$1.treatEscapes0__p1__T__Z__T(str, false)
    })
  })(this);
  this.checkLengths__sc_Seq__V(args);
  var pi = this.parts$1.iterator__sc_Iterator();
  var ai = args.iterator__sc_Iterator();
  var arg1 = pi.next__O();
  var bldr = new $c_jl_StringBuilder().init___T($as_T(f(arg1)));
  while (ai.hasNext__Z()) {
    bldr.append__O__jl_StringBuilder(ai.next__O());
    var arg1$1 = pi.next__O();
    bldr.append__T__jl_StringBuilder($as_T(f(arg1$1)))
  };
  return bldr.content$1
});
$c_s_StringContext.prototype.init___sc_Seq = (function(parts) {
  this.parts$1 = parts;
  return this
});
$c_s_StringContext.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_s_StringContext.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_s_StringContext(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_StringContext)))
}
function $as_s_StringContext(obj) {
  return (($is_s_StringContext(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.StringContext"))
}
function $isArrayOf_s_StringContext(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_StringContext)))
}
function $asArrayOf_s_StringContext(obj, depth) {
  return (($isArrayOf_s_StringContext(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.StringContext;", depth))
}
var $d_s_StringContext = new $TypeData().initClass({
  s_StringContext: 0
}, false, "scala.StringContext", {
  s_StringContext: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_StringContext.prototype.$classData = $d_s_StringContext;
/** @constructor */
function $c_s_util_Either() {
  $c_O.call(this)
}
$c_s_util_Either.prototype = new $h_O();
$c_s_util_Either.prototype.constructor = $c_s_util_Either;
/** @constructor */
function $h_s_util_Either() {
  /*<skip>*/
}
$h_s_util_Either.prototype = $c_s_util_Either.prototype;
function $is_s_util_Either(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_util_Either)))
}
function $as_s_util_Either(obj) {
  return (($is_s_util_Either(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.util.Either"))
}
function $isArrayOf_s_util_Either(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_util_Either)))
}
function $asArrayOf_s_util_Either(obj, depth) {
  return (($isArrayOf_s_util_Either(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.util.Either;", depth))
}
/** @constructor */
function $c_s_util_control_BreakControl() {
  $c_jl_Throwable.call(this)
}
$c_s_util_control_BreakControl.prototype = new $h_jl_Throwable();
$c_s_util_control_BreakControl.prototype.constructor = $c_s_util_control_BreakControl;
/** @constructor */
function $h_s_util_control_BreakControl() {
  /*<skip>*/
}
$h_s_util_control_BreakControl.prototype = $c_s_util_control_BreakControl.prototype;
$c_s_util_control_BreakControl.prototype.init___ = (function() {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
$c_s_util_control_BreakControl.prototype.fillInStackTrace__jl_Throwable = (function() {
  return $f_s_util_control_NoStackTrace__fillInStackTrace__jl_Throwable(this)
});
var $d_s_util_control_BreakControl = new $TypeData().initClass({
  s_util_control_BreakControl: 0
}, false, "scala.util.control.BreakControl", {
  s_util_control_BreakControl: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_util_control_ControlThrowable: 1,
  s_util_control_NoStackTrace: 1
});
$c_s_util_control_BreakControl.prototype.$classData = $d_s_util_control_BreakControl;
function $f_sc_GenSeqLike__equals__O__Z($thiz, that) {
  if ($is_sc_GenSeq(that)) {
    var x2 = $as_sc_GenSeq(that);
    return $thiz.sameElements__sc_GenIterable__Z(x2)
  } else {
    return false
  }
}
function $f_sc_GenSeqLike__isDefinedAt__I__Z($thiz, idx) {
  return ((idx >= 0) && (idx < $thiz.length__I()))
}
function $is_sc_GenTraversable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenTraversable)))
}
function $as_sc_GenTraversable(obj) {
  return (($is_sc_GenTraversable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.GenTraversable"))
}
function $isArrayOf_sc_GenTraversable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenTraversable)))
}
function $asArrayOf_sc_GenTraversable(obj, depth) {
  return (($isArrayOf_sc_GenTraversable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.GenTraversable;", depth))
}
/** @constructor */
function $c_sc_Iterable$() {
  $c_scg_GenTraversableFactory.call(this)
}
$c_sc_Iterable$.prototype = new $h_scg_GenTraversableFactory();
$c_sc_Iterable$.prototype.constructor = $c_sc_Iterable$;
/** @constructor */
function $h_sc_Iterable$() {
  /*<skip>*/
}
$h_sc_Iterable$.prototype = $c_sc_Iterable$.prototype;
$c_sc_Iterable$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sc_Iterable$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_Iterable$();
  return new $c_scm_ListBuffer().init___()
});
var $d_sc_Iterable$ = new $TypeData().initClass({
  sc_Iterable$: 0
}, false, "scala.collection.Iterable$", {
  sc_Iterable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_Iterable$.prototype.$classData = $d_sc_Iterable$;
var $n_sc_Iterable$ = (void 0);
function $m_sc_Iterable$() {
  if ((!$n_sc_Iterable$)) {
    $n_sc_Iterable$ = new $c_sc_Iterable$().init___()
  };
  return $n_sc_Iterable$
}
/** @constructor */
function $c_sc_Iterator$$anon$10() {
  $c_sc_AbstractIterator.call(this);
  this.$$outer$2 = null;
  this.f$1$2 = null
}
$c_sc_Iterator$$anon$10.prototype = new $h_sc_AbstractIterator();
$c_sc_Iterator$$anon$10.prototype.constructor = $c_sc_Iterator$$anon$10;
/** @constructor */
function $h_sc_Iterator$$anon$10() {
  /*<skip>*/
}
$h_sc_Iterator$$anon$10.prototype = $c_sc_Iterator$$anon$10.prototype;
$c_sc_Iterator$$anon$10.prototype.next__O = (function() {
  return this.f$1$2.apply__O__O(this.$$outer$2.next__O())
});
$c_sc_Iterator$$anon$10.prototype.init___sc_Iterator__F1 = (function($$outer, f$1) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  this.f$1$2 = f$1;
  return this
});
$c_sc_Iterator$$anon$10.prototype.hasNext__Z = (function() {
  return this.$$outer$2.hasNext__Z()
});
var $d_sc_Iterator$$anon$10 = new $TypeData().initClass({
  sc_Iterator$$anon$10: 0
}, false, "scala.collection.Iterator$$anon$10", {
  sc_Iterator$$anon$10: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sc_Iterator$$anon$10.prototype.$classData = $d_sc_Iterator$$anon$10;
/** @constructor */
function $c_sc_Iterator$$anon$12() {
  $c_sc_AbstractIterator.call(this);
  this.hd$2 = null;
  this.hdDefined$2 = false;
  this.$$outer$2 = null;
  this.p$1$2 = null
}
$c_sc_Iterator$$anon$12.prototype = new $h_sc_AbstractIterator();
$c_sc_Iterator$$anon$12.prototype.constructor = $c_sc_Iterator$$anon$12;
/** @constructor */
function $h_sc_Iterator$$anon$12() {
  /*<skip>*/
}
$h_sc_Iterator$$anon$12.prototype = $c_sc_Iterator$$anon$12.prototype;
$c_sc_Iterator$$anon$12.prototype.next__O = (function() {
  if (this.hasNext__Z()) {
    this.hdDefined$2 = false;
    return this.hd$2
  } else {
    return $m_sc_Iterator$().empty$1.next__O()
  }
});
$c_sc_Iterator$$anon$12.prototype.init___sc_Iterator__F1 = (function($$outer, p$1) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  this.p$1$2 = p$1;
  this.hdDefined$2 = false;
  return this
});
$c_sc_Iterator$$anon$12.prototype.hasNext__Z = (function() {
  if (this.hdDefined$2) {
    return true
  } else {
    do {
      if ((!this.$$outer$2.hasNext__Z())) {
        return false
      };
      this.hd$2 = this.$$outer$2.next__O()
    } while ((!$uZ(this.p$1$2.apply__O__O(this.hd$2))));
    this.hdDefined$2 = true;
    return true
  }
});
var $d_sc_Iterator$$anon$12 = new $TypeData().initClass({
  sc_Iterator$$anon$12: 0
}, false, "scala.collection.Iterator$$anon$12", {
  sc_Iterator$$anon$12: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sc_Iterator$$anon$12.prototype.$classData = $d_sc_Iterator$$anon$12;
/** @constructor */
function $c_sc_Iterator$$anon$2() {
  $c_sc_AbstractIterator.call(this)
}
$c_sc_Iterator$$anon$2.prototype = new $h_sc_AbstractIterator();
$c_sc_Iterator$$anon$2.prototype.constructor = $c_sc_Iterator$$anon$2;
/** @constructor */
function $h_sc_Iterator$$anon$2() {
  /*<skip>*/
}
$h_sc_Iterator$$anon$2.prototype = $c_sc_Iterator$$anon$2.prototype;
$c_sc_Iterator$$anon$2.prototype.init___ = (function() {
  return this
});
$c_sc_Iterator$$anon$2.prototype.next__O = (function() {
  this.next__sr_Nothing$()
});
$c_sc_Iterator$$anon$2.prototype.next__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("next on empty iterator")
});
$c_sc_Iterator$$anon$2.prototype.hasNext__Z = (function() {
  return false
});
var $d_sc_Iterator$$anon$2 = new $TypeData().initClass({
  sc_Iterator$$anon$2: 0
}, false, "scala.collection.Iterator$$anon$2", {
  sc_Iterator$$anon$2: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sc_Iterator$$anon$2.prototype.$classData = $d_sc_Iterator$$anon$2;
/** @constructor */
function $c_sc_LinearSeqLike$$anon$1() {
  $c_sc_AbstractIterator.call(this);
  this.these$2 = null
}
$c_sc_LinearSeqLike$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_sc_LinearSeqLike$$anon$1.prototype.constructor = $c_sc_LinearSeqLike$$anon$1;
/** @constructor */
function $h_sc_LinearSeqLike$$anon$1() {
  /*<skip>*/
}
$h_sc_LinearSeqLike$$anon$1.prototype = $c_sc_LinearSeqLike$$anon$1.prototype;
$c_sc_LinearSeqLike$$anon$1.prototype.init___sc_LinearSeqLike = (function($$outer) {
  this.these$2 = $$outer;
  return this
});
$c_sc_LinearSeqLike$$anon$1.prototype.next__O = (function() {
  if (this.hasNext__Z()) {
    var result = this.these$2.head__O();
    this.these$2 = $as_sc_LinearSeqLike(this.these$2.tail__O());
    return result
  } else {
    return $m_sc_Iterator$().empty$1.next__O()
  }
});
$c_sc_LinearSeqLike$$anon$1.prototype.hasNext__Z = (function() {
  return (!this.these$2.isEmpty__Z())
});
var $d_sc_LinearSeqLike$$anon$1 = new $TypeData().initClass({
  sc_LinearSeqLike$$anon$1: 0
}, false, "scala.collection.LinearSeqLike$$anon$1", {
  sc_LinearSeqLike$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sc_LinearSeqLike$$anon$1.prototype.$classData = $d_sc_LinearSeqLike$$anon$1;
/** @constructor */
function $c_sc_Traversable$() {
  $c_scg_GenTraversableFactory.call(this);
  this.breaks$3 = null
}
$c_sc_Traversable$.prototype = new $h_scg_GenTraversableFactory();
$c_sc_Traversable$.prototype.constructor = $c_sc_Traversable$;
/** @constructor */
function $h_sc_Traversable$() {
  /*<skip>*/
}
$h_sc_Traversable$.prototype = $c_sc_Traversable$.prototype;
$c_sc_Traversable$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  $n_sc_Traversable$ = this;
  this.breaks$3 = new $c_s_util_control_Breaks().init___();
  return this
});
$c_sc_Traversable$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_Traversable$();
  return new $c_scm_ListBuffer().init___()
});
var $d_sc_Traversable$ = new $TypeData().initClass({
  sc_Traversable$: 0
}, false, "scala.collection.Traversable$", {
  sc_Traversable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_Traversable$.prototype.$classData = $d_sc_Traversable$;
var $n_sc_Traversable$ = (void 0);
function $m_sc_Traversable$() {
  if ((!$n_sc_Traversable$)) {
    $n_sc_Traversable$ = new $c_sc_Traversable$().init___()
  };
  return $n_sc_Traversable$
}
/** @constructor */
function $c_scg_ImmutableSetFactory() {
  $c_scg_SetFactory.call(this)
}
$c_scg_ImmutableSetFactory.prototype = new $h_scg_SetFactory();
$c_scg_ImmutableSetFactory.prototype.constructor = $c_scg_ImmutableSetFactory;
/** @constructor */
function $h_scg_ImmutableSetFactory() {
  /*<skip>*/
}
$h_scg_ImmutableSetFactory.prototype = $c_scg_ImmutableSetFactory.prototype;
$c_scg_ImmutableSetFactory.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_SetBuilder().init___sc_Set(this.emptyInstance__sci_Set())
});
/** @constructor */
function $c_sci_Iterable$() {
  $c_scg_GenTraversableFactory.call(this)
}
$c_sci_Iterable$.prototype = new $h_scg_GenTraversableFactory();
$c_sci_Iterable$.prototype.constructor = $c_sci_Iterable$;
/** @constructor */
function $h_sci_Iterable$() {
  /*<skip>*/
}
$h_sci_Iterable$.prototype = $c_sci_Iterable$.prototype;
$c_sci_Iterable$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sci_Iterable$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ListBuffer().init___()
});
var $d_sci_Iterable$ = new $TypeData().initClass({
  sci_Iterable$: 0
}, false, "scala.collection.immutable.Iterable$", {
  sci_Iterable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Iterable$.prototype.$classData = $d_sci_Iterable$;
var $n_sci_Iterable$ = (void 0);
function $m_sci_Iterable$() {
  if ((!$n_sci_Iterable$)) {
    $n_sci_Iterable$ = new $c_sci_Iterable$().init___()
  };
  return $n_sci_Iterable$
}
/** @constructor */
function $c_sci_StreamIterator() {
  $c_sc_AbstractIterator.call(this);
  this.these$2 = null
}
$c_sci_StreamIterator.prototype = new $h_sc_AbstractIterator();
$c_sci_StreamIterator.prototype.constructor = $c_sci_StreamIterator;
/** @constructor */
function $h_sci_StreamIterator() {
  /*<skip>*/
}
$h_sci_StreamIterator.prototype = $c_sci_StreamIterator.prototype;
$c_sci_StreamIterator.prototype.next__O = (function() {
  if ($f_sc_Iterator__isEmpty__Z(this)) {
    return $m_sc_Iterator$().empty$1.next__O()
  } else {
    var cur = this.these$2.v__sci_Stream();
    var result = cur.head__O();
    this.these$2 = new $c_sci_StreamIterator$LazyCell().init___sci_StreamIterator__F0(this, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, cur$1) {
      return (function() {
        return $as_sci_Stream(cur$1.tail__O())
      })
    })(this, cur)));
    return result
  }
});
$c_sci_StreamIterator.prototype.init___sci_Stream = (function(self) {
  this.these$2 = new $c_sci_StreamIterator$LazyCell().init___sci_StreamIterator__F0(this, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, self$1) {
    return (function() {
      return self$1
    })
  })(this, self)));
  return this
});
$c_sci_StreamIterator.prototype.hasNext__Z = (function() {
  var this$1 = this.these$2.v__sci_Stream();
  return $f_sc_TraversableOnce__nonEmpty__Z(this$1)
});
$c_sci_StreamIterator.prototype.toStream__sci_Stream = (function() {
  var result = this.these$2.v__sci_Stream();
  this.these$2 = new $c_sci_StreamIterator$LazyCell().init___sci_StreamIterator__F0(this, new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
    return (function() {
      $m_sci_Stream$();
      return $m_sci_Stream$Empty$()
    })
  })(this)));
  return result
});
var $d_sci_StreamIterator = new $TypeData().initClass({
  sci_StreamIterator: 0
}, false, "scala.collection.immutable.StreamIterator", {
  sci_StreamIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sci_StreamIterator.prototype.$classData = $d_sci_StreamIterator;
/** @constructor */
function $c_sci_Traversable$() {
  $c_scg_GenTraversableFactory.call(this)
}
$c_sci_Traversable$.prototype = new $h_scg_GenTraversableFactory();
$c_sci_Traversable$.prototype.constructor = $c_sci_Traversable$;
/** @constructor */
function $h_sci_Traversable$() {
  /*<skip>*/
}
$h_sci_Traversable$.prototype = $c_sci_Traversable$.prototype;
$c_sci_Traversable$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sci_Traversable$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ListBuffer().init___()
});
var $d_sci_Traversable$ = new $TypeData().initClass({
  sci_Traversable$: 0
}, false, "scala.collection.immutable.Traversable$", {
  sci_Traversable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Traversable$.prototype.$classData = $d_sci_Traversable$;
var $n_sci_Traversable$ = (void 0);
function $m_sci_Traversable$() {
  if ((!$n_sci_Traversable$)) {
    $n_sci_Traversable$ = new $c_sci_Traversable$().init___()
  };
  return $n_sci_Traversable$
}
/** @constructor */
function $c_sci_TrieIterator() {
  $c_sc_AbstractIterator.call(this);
  this.elems$2 = null;
  this.scala$collection$immutable$TrieIterator$$depth$f = 0;
  this.scala$collection$immutable$TrieIterator$$arrayStack$f = null;
  this.scala$collection$immutable$TrieIterator$$posStack$f = null;
  this.scala$collection$immutable$TrieIterator$$arrayD$f = null;
  this.scala$collection$immutable$TrieIterator$$posD$f = 0;
  this.scala$collection$immutable$TrieIterator$$subIter$f = null
}
$c_sci_TrieIterator.prototype = new $h_sc_AbstractIterator();
$c_sci_TrieIterator.prototype.constructor = $c_sci_TrieIterator;
/** @constructor */
function $h_sci_TrieIterator() {
  /*<skip>*/
}
$h_sci_TrieIterator.prototype = $c_sci_TrieIterator.prototype;
$c_sci_TrieIterator.prototype.isContainer__p2__O__Z = (function(x) {
  return ($is_sci_HashMap$HashMap1(x) || $is_sci_HashSet$HashSet1(x))
});
$c_sci_TrieIterator.prototype.next__O = (function() {
  if ((this.scala$collection$immutable$TrieIterator$$subIter$f !== null)) {
    var el = this.scala$collection$immutable$TrieIterator$$subIter$f.next__O();
    if ((!this.scala$collection$immutable$TrieIterator$$subIter$f.hasNext__Z())) {
      this.scala$collection$immutable$TrieIterator$$subIter$f = null
    };
    return el
  } else {
    return this.next0__p2__Asci_Iterable__I__O(this.scala$collection$immutable$TrieIterator$$arrayD$f, this.scala$collection$immutable$TrieIterator$$posD$f)
  }
});
$c_sci_TrieIterator.prototype.initPosStack__AI = (function() {
  return $newArrayObject($d_I.getArrayOf(), [6])
});
$c_sci_TrieIterator.prototype.hasNext__Z = (function() {
  return ((this.scala$collection$immutable$TrieIterator$$subIter$f !== null) || (this.scala$collection$immutable$TrieIterator$$depth$f >= 0))
});
$c_sci_TrieIterator.prototype.next0__p2__Asci_Iterable__I__O = (function(elems, i) {
  _next0: while (true) {
    if ((i === (((-1) + elems.u.length) | 0))) {
      this.scala$collection$immutable$TrieIterator$$depth$f = (((-1) + this.scala$collection$immutable$TrieIterator$$depth$f) | 0);
      if ((this.scala$collection$immutable$TrieIterator$$depth$f >= 0)) {
        this.scala$collection$immutable$TrieIterator$$arrayD$f = this.scala$collection$immutable$TrieIterator$$arrayStack$f.get(this.scala$collection$immutable$TrieIterator$$depth$f);
        this.scala$collection$immutable$TrieIterator$$posD$f = this.scala$collection$immutable$TrieIterator$$posStack$f.get(this.scala$collection$immutable$TrieIterator$$depth$f);
        this.scala$collection$immutable$TrieIterator$$arrayStack$f.set(this.scala$collection$immutable$TrieIterator$$depth$f, null)
      } else {
        this.scala$collection$immutable$TrieIterator$$arrayD$f = null;
        this.scala$collection$immutable$TrieIterator$$posD$f = 0
      }
    } else {
      this.scala$collection$immutable$TrieIterator$$posD$f = ((1 + this.scala$collection$immutable$TrieIterator$$posD$f) | 0)
    };
    var m = elems.get(i);
    if (this.isContainer__p2__O__Z(m)) {
      return $as_sci_HashSet$HashSet1(m).key$6
    } else if (this.isTrie__p2__O__Z(m)) {
      if ((this.scala$collection$immutable$TrieIterator$$depth$f >= 0)) {
        this.scala$collection$immutable$TrieIterator$$arrayStack$f.set(this.scala$collection$immutable$TrieIterator$$depth$f, this.scala$collection$immutable$TrieIterator$$arrayD$f);
        this.scala$collection$immutable$TrieIterator$$posStack$f.set(this.scala$collection$immutable$TrieIterator$$depth$f, this.scala$collection$immutable$TrieIterator$$posD$f)
      };
      this.scala$collection$immutable$TrieIterator$$depth$f = ((1 + this.scala$collection$immutable$TrieIterator$$depth$f) | 0);
      this.scala$collection$immutable$TrieIterator$$arrayD$f = this.getElems__p2__sci_Iterable__Asci_Iterable(m);
      this.scala$collection$immutable$TrieIterator$$posD$f = 0;
      var temp$elems = this.getElems__p2__sci_Iterable__Asci_Iterable(m);
      elems = temp$elems;
      i = 0;
      continue _next0
    } else {
      this.scala$collection$immutable$TrieIterator$$subIter$f = m.iterator__sc_Iterator();
      return this.next__O()
    }
  }
});
$c_sci_TrieIterator.prototype.getElems__p2__sci_Iterable__Asci_Iterable = (function(x) {
  if ($is_sci_HashMap$HashTrieMap(x)) {
    var x2 = $as_sci_HashMap$HashTrieMap(x);
    var jsx$1 = $asArrayOf_sc_AbstractIterable(x2.elems__Asci_HashMap(), 1)
  } else {
    if ((!$is_sci_HashSet$HashTrieSet(x))) {
      throw new $c_s_MatchError().init___O(x)
    };
    var x3 = $as_sci_HashSet$HashTrieSet(x);
    var jsx$1 = x3.elems$5
  };
  return $asArrayOf_sci_Iterable(jsx$1, 1)
});
$c_sci_TrieIterator.prototype.init___Asci_Iterable = (function(elems) {
  this.elems$2 = elems;
  this.scala$collection$immutable$TrieIterator$$depth$f = 0;
  this.scala$collection$immutable$TrieIterator$$arrayStack$f = this.initArrayStack__AAsci_Iterable();
  this.scala$collection$immutable$TrieIterator$$posStack$f = this.initPosStack__AI();
  this.scala$collection$immutable$TrieIterator$$arrayD$f = this.elems$2;
  this.scala$collection$immutable$TrieIterator$$posD$f = 0;
  this.scala$collection$immutable$TrieIterator$$subIter$f = null;
  return this
});
$c_sci_TrieIterator.prototype.isTrie__p2__O__Z = (function(x) {
  return ($is_sci_HashMap$HashTrieMap(x) || $is_sci_HashSet$HashTrieSet(x))
});
$c_sci_TrieIterator.prototype.initArrayStack__AAsci_Iterable = (function() {
  return $newArrayObject($d_sci_Iterable.getArrayOf().getArrayOf(), [6])
});
/** @constructor */
function $c_scm_Builder$$anon$1() {
  $c_O.call(this);
  this.self$1 = null;
  this.f$1$1 = null
}
$c_scm_Builder$$anon$1.prototype = new $h_O();
$c_scm_Builder$$anon$1.prototype.constructor = $c_scm_Builder$$anon$1;
/** @constructor */
function $h_scm_Builder$$anon$1() {
  /*<skip>*/
}
$h_scm_Builder$$anon$1.prototype = $c_scm_Builder$$anon$1.prototype;
$c_scm_Builder$$anon$1.prototype.init___scm_Builder__F1 = (function($$outer, f$1) {
  this.f$1$1 = f$1;
  this.self$1 = $$outer;
  return this
});
$c_scm_Builder$$anon$1.prototype.equals__O__Z = (function(that) {
  return $f_s_Proxy__equals__O__Z(this, that)
});
$c_scm_Builder$$anon$1.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_Builder$$anon$1(elem)
});
$c_scm_Builder$$anon$1.prototype.toString__T = (function() {
  return $f_s_Proxy__toString__T(this)
});
$c_scm_Builder$$anon$1.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_Builder$$anon$1 = (function(xs) {
  this.self$1.$$plus$plus$eq__sc_TraversableOnce__scg_Growable(xs);
  return this
});
$c_scm_Builder$$anon$1.prototype.result__O = (function() {
  return this.f$1$1.apply__O__O(this.self$1.result__O())
});
$c_scm_Builder$$anon$1.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundColl) {
  this.self$1.sizeHintBounded__I__sc_TraversableLike__V(size, boundColl)
});
$c_scm_Builder$$anon$1.prototype.$$plus$eq__O__scm_Builder$$anon$1 = (function(x) {
  this.self$1.$$plus$eq__O__scm_Builder(x);
  return this
});
$c_scm_Builder$$anon$1.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_Builder$$anon$1(elem)
});
$c_scm_Builder$$anon$1.prototype.hashCode__I = (function() {
  return this.self$1.hashCode__I()
});
$c_scm_Builder$$anon$1.prototype.sizeHint__I__V = (function(size) {
  this.self$1.sizeHint__I__V(size)
});
$c_scm_Builder$$anon$1.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_Builder$$anon$1(xs)
});
var $d_scm_Builder$$anon$1 = new $TypeData().initClass({
  scm_Builder$$anon$1: 0
}, false, "scala.collection.mutable.Builder$$anon$1", {
  scm_Builder$$anon$1: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Proxy: 1
});
$c_scm_Builder$$anon$1.prototype.$classData = $d_scm_Builder$$anon$1;
/** @constructor */
function $c_scm_LazyBuilder() {
  $c_O.call(this);
  this.parts$1 = null
}
$c_scm_LazyBuilder.prototype = new $h_O();
$c_scm_LazyBuilder.prototype.constructor = $c_scm_LazyBuilder;
/** @constructor */
function $h_scm_LazyBuilder() {
  /*<skip>*/
}
$h_scm_LazyBuilder.prototype = $c_scm_LazyBuilder.prototype;
$c_scm_LazyBuilder.prototype.init___ = (function() {
  this.parts$1 = new $c_scm_ListBuffer().init___();
  return this
});
$c_scm_LazyBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_LazyBuilder = (function(xs) {
  this.parts$1.$$plus$eq__O__scm_ListBuffer(xs);
  return this
});
$c_scm_LazyBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_LazyBuilder(elem)
});
$c_scm_LazyBuilder.prototype.$$plus$eq__O__scm_LazyBuilder = (function(x) {
  var jsx$1 = this.parts$1;
  $m_sci_List$();
  var xs = new $c_sjs_js_WrappedArray().init___sjs_js_Array([x]);
  var this$2 = $m_sci_List$();
  var cbf = this$2.ReusableCBFInstance$2;
  jsx$1.$$plus$eq__O__scm_ListBuffer($as_sci_List($f_sc_TraversableLike__to__scg_CanBuildFrom__O(xs, cbf)));
  return this
});
$c_scm_LazyBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_LazyBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_LazyBuilder(elem)
});
$c_scm_LazyBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_LazyBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_LazyBuilder(xs)
});
/** @constructor */
function $c_scm_ListBuffer$$anon$1() {
  $c_sc_AbstractIterator.call(this);
  this.cursor$2 = null
}
$c_scm_ListBuffer$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_scm_ListBuffer$$anon$1.prototype.constructor = $c_scm_ListBuffer$$anon$1;
/** @constructor */
function $h_scm_ListBuffer$$anon$1() {
  /*<skip>*/
}
$h_scm_ListBuffer$$anon$1.prototype = $c_scm_ListBuffer$$anon$1.prototype;
$c_scm_ListBuffer$$anon$1.prototype.init___scm_ListBuffer = (function($$outer) {
  this.cursor$2 = ($$outer.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z() ? $m_sci_Nil$() : $$outer.scala$collection$mutable$ListBuffer$$start$6);
  return this
});
$c_scm_ListBuffer$$anon$1.prototype.next__O = (function() {
  if ((!this.hasNext__Z())) {
    throw new $c_ju_NoSuchElementException().init___T("next on empty Iterator")
  } else {
    var ans = this.cursor$2.head__O();
    var this$1 = this.cursor$2;
    this.cursor$2 = this$1.tail__sci_List();
    return ans
  }
});
$c_scm_ListBuffer$$anon$1.prototype.hasNext__Z = (function() {
  return (this.cursor$2 !== $m_sci_Nil$())
});
var $d_scm_ListBuffer$$anon$1 = new $TypeData().initClass({
  scm_ListBuffer$$anon$1: 0
}, false, "scala.collection.mutable.ListBuffer$$anon$1", {
  scm_ListBuffer$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_scm_ListBuffer$$anon$1.prototype.$classData = $d_scm_ListBuffer$$anon$1;
/** @constructor */
function $c_scm_SetBuilder() {
  $c_O.call(this);
  this.empty$1 = null;
  this.elems$1 = null
}
$c_scm_SetBuilder.prototype = new $h_O();
$c_scm_SetBuilder.prototype.constructor = $c_scm_SetBuilder;
/** @constructor */
function $h_scm_SetBuilder() {
  /*<skip>*/
}
$h_scm_SetBuilder.prototype = $c_scm_SetBuilder.prototype;
$c_scm_SetBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_SetBuilder(elem)
});
$c_scm_SetBuilder.prototype.result__O = (function() {
  return this.elems$1
});
$c_scm_SetBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_SetBuilder.prototype.$$plus$eq__O__scm_SetBuilder = (function(x) {
  this.elems$1 = this.elems$1.$$plus__O__sc_Set(x);
  return this
});
$c_scm_SetBuilder.prototype.init___sc_Set = (function(empty) {
  this.empty$1 = empty;
  this.elems$1 = empty;
  return this
});
$c_scm_SetBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_SetBuilder(elem)
});
$c_scm_SetBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_SetBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
});
var $d_scm_SetBuilder = new $TypeData().initClass({
  scm_SetBuilder: 0
}, false, "scala.collection.mutable.SetBuilder", {
  scm_SetBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_scm_SetBuilder.prototype.$classData = $d_scm_SetBuilder;
/** @constructor */
function $c_sr_ScalaRunTime$$anon$1() {
  $c_sc_AbstractIterator.call(this);
  this.c$2 = 0;
  this.cmax$2 = 0;
  this.x$2$2 = null
}
$c_sr_ScalaRunTime$$anon$1.prototype = new $h_sc_AbstractIterator();
$c_sr_ScalaRunTime$$anon$1.prototype.constructor = $c_sr_ScalaRunTime$$anon$1;
/** @constructor */
function $h_sr_ScalaRunTime$$anon$1() {
  /*<skip>*/
}
$h_sr_ScalaRunTime$$anon$1.prototype = $c_sr_ScalaRunTime$$anon$1.prototype;
$c_sr_ScalaRunTime$$anon$1.prototype.next__O = (function() {
  var result = this.x$2$2.productElement__I__O(this.c$2);
  this.c$2 = ((1 + this.c$2) | 0);
  return result
});
$c_sr_ScalaRunTime$$anon$1.prototype.init___s_Product = (function(x$2) {
  this.x$2$2 = x$2;
  this.c$2 = 0;
  this.cmax$2 = x$2.productArity__I();
  return this
});
$c_sr_ScalaRunTime$$anon$1.prototype.hasNext__Z = (function() {
  return (this.c$2 < this.cmax$2)
});
var $d_sr_ScalaRunTime$$anon$1 = new $TypeData().initClass({
  sr_ScalaRunTime$$anon$1: 0
}, false, "scala.runtime.ScalaRunTime$$anon$1", {
  sr_ScalaRunTime$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sr_ScalaRunTime$$anon$1.prototype.$classData = $d_sr_ScalaRunTime$$anon$1;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_Js$$anon$3() {
  $c_O.call(this);
  this.raw$1 = null;
  this.mountRaw$1 = null;
  this.vdomElement$1 = null
}
$c_Ljapgolly_scalajs_react_component_Js$$anon$3.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_Js$$anon$3.prototype.constructor = $c_Ljapgolly_scalajs_react_component_Js$$anon$3;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_Js$$anon$3() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_Js$$anon$3.prototype = $c_Ljapgolly_scalajs_react_component_Js$$anon$3.prototype;
$c_Ljapgolly_scalajs_react_component_Js$$anon$3.prototype.vdomElement__Ljapgolly_scalajs_react_vdom_VdomElement = (function() {
  return this.vdomElement$1
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$3.prototype.mountRaw__F1 = (function() {
  return this.mountRaw$1
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$3.prototype.raw__Ljapgolly_scalajs_react_raw_package$ReactComponentElement = (function() {
  return this.raw$1
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$3.prototype.init___Ljapgolly_scalajs_react_raw_package$ReactComponentElement__F1 = (function(r$1, m$1) {
  this.raw$1 = r$1;
  this.mountRaw$1 = m$1;
  var n = this.raw$1;
  this.vdomElement$1 = new $c_Ljapgolly_scalajs_react_vdom_VdomElement().init___Ljapgolly_scalajs_react_raw_package$ReactElement(n);
  return this
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$3.prototype.mapMounted__F1__Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot = (function(f) {
  $m_Ljapgolly_scalajs_react_component_Js$();
  var mp = $m_Ljapgolly_scalajs_react_internal_package$().identityFnInstance$1;
  return new $c_Ljapgolly_scalajs_react_component_Js$$anon$4().init___Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot__F1__F1(this, mp, f)
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$3.prototype.mapUnmountedProps__F1__Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot = (function(f) {
  $m_Ljapgolly_scalajs_react_component_Js$();
  var mm = $m_Ljapgolly_scalajs_react_internal_package$().identityFnInstance$1;
  return new $c_Ljapgolly_scalajs_react_component_Js$$anon$4().init___Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot__F1__F1(this, f, mm)
});
var $d_Ljapgolly_scalajs_react_component_Js$$anon$3 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_Js$$anon$3: 0
}, false, "japgolly.scalajs.react.component.Js$$anon$3", {
  Ljapgolly_scalajs_react_component_Js$$anon$3: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot: 1,
  Ljapgolly_scalajs_react_component_Js$UnmountedSimple: 1,
  Ljapgolly_scalajs_react_component_Generic$UnmountedSimple: 1,
  Ljapgolly_scalajs_react_component_Generic$UnmountedRaw: 1,
  Ljapgolly_scalajs_react_component_Generic$UnmountedWithRoot: 1
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$3.prototype.$classData = $d_Ljapgolly_scalajs_react_component_Js$$anon$3;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_Js$$anon$4() {
  $c_O.call(this);
  this.raw$1 = null;
  this.mountRaw$1 = null;
  this.from$1$1 = null;
  this.mp$1$1 = null;
  this.mm$1$1 = null
}
$c_Ljapgolly_scalajs_react_component_Js$$anon$4.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_Js$$anon$4.prototype.constructor = $c_Ljapgolly_scalajs_react_component_Js$$anon$4;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_Js$$anon$4() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_Js$$anon$4.prototype = $c_Ljapgolly_scalajs_react_component_Js$$anon$4.prototype;
$c_Ljapgolly_scalajs_react_component_Js$$anon$4.prototype.vdomElement__Ljapgolly_scalajs_react_vdom_VdomElement = (function() {
  return this.from$1$1.vdomElement__Ljapgolly_scalajs_react_vdom_VdomElement()
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$4.prototype.mountRaw__F1 = (function() {
  return this.mountRaw$1
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$4.prototype.raw__Ljapgolly_scalajs_react_raw_package$ReactComponentElement = (function() {
  return this.raw$1
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$4.prototype.mapMounted__F1__Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot = (function(f) {
  $m_Ljapgolly_scalajs_react_component_Js$();
  var from = this.from$1$1;
  var mp = this.mp$1$1;
  var g = this.mm$1$1;
  var mm = $f_F1__compose__F1__F1(f, g);
  return new $c_Ljapgolly_scalajs_react_component_Js$$anon$4().init___Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot__F1__F1(from, mp, mm)
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$4.prototype.init___Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot__F1__F1 = (function(from$1, mp$1, mm$1) {
  this.from$1$1 = from$1;
  this.mp$1$1 = mp$1;
  this.mm$1$1 = mm$1;
  this.raw$1 = from$1.raw__Ljapgolly_scalajs_react_raw_package$ReactComponentElement();
  var g = from$1.mountRaw__F1();
  this.mountRaw$1 = $f_F1__compose__F1__F1(mm$1, g);
  return this
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$4.prototype.mapUnmountedProps__F1__Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot = (function(f) {
  $m_Ljapgolly_scalajs_react_component_Js$();
  var from = this.from$1$1;
  var g = this.mp$1$1;
  var mp = $f_F1__compose__F1__F1(f, g);
  var mm = this.mm$1$1;
  return new $c_Ljapgolly_scalajs_react_component_Js$$anon$4().init___Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot__F1__F1(from, mp, mm)
});
var $d_Ljapgolly_scalajs_react_component_Js$$anon$4 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_Js$$anon$4: 0
}, false, "japgolly.scalajs.react.component.Js$$anon$4", {
  Ljapgolly_scalajs_react_component_Js$$anon$4: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_Js$UnmountedWithRoot: 1,
  Ljapgolly_scalajs_react_component_Js$UnmountedSimple: 1,
  Ljapgolly_scalajs_react_component_Generic$UnmountedSimple: 1,
  Ljapgolly_scalajs_react_component_Generic$UnmountedRaw: 1,
  Ljapgolly_scalajs_react_component_Generic$UnmountedWithRoot: 1
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$4.prototype.$classData = $d_Ljapgolly_scalajs_react_component_Js$$anon$4;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1() {
  $c_O.call(this);
  this.raw$1 = null;
  this.ctor$1 = null;
  this.$$outer$1 = null;
  this.pf$1$1 = null
}
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1.prototype.constructor = $c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1.prototype = $c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1.prototype;
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1.prototype.init___Ljapgolly_scalajs_react_component_JsBaseComponentTemplate__sjs_js_Any__Ljapgolly_scalajs_react_CtorType__Ljapgolly_scalajs_react_internal_Profunctor = (function($$outer, rc$1, c$1, pf$1) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  this.pf$1$1 = pf$1;
  this.raw$1 = rc$1;
  this.ctor$1 = c$1;
  return this
});
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1.prototype.ctor__Ljapgolly_scalajs_react_CtorType = (function() {
  return this.ctor$1
});
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1.prototype.raw__sjs_js_Any = (function() {
  return this.raw$1
});
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1.prototype.cmapCtorProps__F1__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot = (function(f) {
  var this$1 = this.$$outer$1;
  var mc = $m_Ljapgolly_scalajs_react_internal_package$().identityFnInstance$1;
  var mu = $m_Ljapgolly_scalajs_react_internal_package$().identityFnInstance$1;
  var pf = this.pf$1$1;
  return new $c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2().init___Ljapgolly_scalajs_react_component_JsBaseComponentTemplate__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot__F1__F1__F1__Ljapgolly_scalajs_react_internal_Profunctor(this$1, this, f, mc, mu, pf)
});
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1.prototype.mapUnmounted__F1__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot = (function(f) {
  var this$1 = this.$$outer$1;
  var cp = $m_Ljapgolly_scalajs_react_internal_package$().identityFnInstance$1;
  var mc = $m_Ljapgolly_scalajs_react_internal_package$().identityFnInstance$1;
  var pf = this.pf$1$1;
  return new $c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2().init___Ljapgolly_scalajs_react_component_JsBaseComponentTemplate__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot__F1__F1__F1__Ljapgolly_scalajs_react_internal_Profunctor(this$1, this, cp, mc, f, pf)
});
var $d_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1: 0
}, false, "japgolly.scalajs.react.component.JsBaseComponentTemplate$$anon$1", {
  Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot: 1,
  Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentSimple: 1,
  Ljapgolly_scalajs_react_component_Generic$ComponentSimple: 1,
  Ljapgolly_scalajs_react_component_Generic$ComponentRaw: 1,
  Ljapgolly_scalajs_react_component_Generic$ComponentWithRoot: 1
});
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1.prototype.$classData = $d_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$1;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2() {
  $c_O.call(this);
  this.raw$1 = null;
  this.ctor$1 = null;
  this.$$outer$1 = null;
  this.from$1$1 = null;
  this.cp$1$1 = null;
  this.mc$1$1 = null;
  this.mu$1$1 = null;
  this.pf$2$1 = null
}
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2.prototype.constructor = $c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2.prototype = $c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2.prototype;
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2.prototype.ctor__Ljapgolly_scalajs_react_CtorType = (function() {
  return this.ctor$1
});
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2.prototype.raw__sjs_js_Any = (function() {
  return this.raw$1
});
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2.prototype.cmapCtorProps__F1__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot = (function(f) {
  var this$2 = this.$$outer$1;
  var from = this.from$1$1;
  var this$1 = this.cp$1$1;
  var cp = $f_F1__compose__F1__F1(this$1, f);
  var mc = this.mc$1$1;
  var mu = this.mu$1$1;
  var pf = this.pf$2$1;
  return new $c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2().init___Ljapgolly_scalajs_react_component_JsBaseComponentTemplate__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot__F1__F1__F1__Ljapgolly_scalajs_react_internal_Profunctor(this$2, from, cp, mc, mu, pf)
});
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2.prototype.init___Ljapgolly_scalajs_react_component_JsBaseComponentTemplate__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot__F1__F1__F1__Ljapgolly_scalajs_react_internal_Profunctor = (function($$outer, from$1, cp$1, mc$1, mu$1, pf$2) {
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$1 = $$outer
  };
  this.from$1$1 = from$1;
  this.cp$1$1 = cp$1;
  this.mc$1$1 = mc$1;
  this.mu$1$1 = mu$1;
  this.pf$2$1 = pf$2;
  this.raw$1 = from$1.raw__sjs_js_Any();
  $m_Ljapgolly_scalajs_react_internal_package$();
  var f = mc$1.apply__O__O(from$1.ctor__Ljapgolly_scalajs_react_CtorType());
  var p = this.pf$2$1;
  this.ctor$1 = $as_Ljapgolly_scalajs_react_CtorType(new $c_Ljapgolly_scalajs_react_internal_Profunctor$Ops().init___O__Ljapgolly_scalajs_react_internal_Profunctor(f, p).dimap__F1__F1__O(cp$1, mu$1));
  return this
});
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2.prototype.mapUnmounted__F1__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot = (function(f) {
  var this$1 = this.$$outer$1;
  var from = this.from$1$1;
  var cp = this.cp$1$1;
  var mc = this.mc$1$1;
  var g = this.mu$1$1;
  var mu = $f_F1__compose__F1__F1(f, g);
  var pf = this.pf$2$1;
  return new $c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2().init___Ljapgolly_scalajs_react_component_JsBaseComponentTemplate__Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot__F1__F1__F1__Ljapgolly_scalajs_react_internal_Profunctor(this$1, from, cp, mc, mu, pf)
});
var $d_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2: 0
}, false, "japgolly.scalajs.react.component.JsBaseComponentTemplate$$anon$2", {
  Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentWithRoot: 1,
  Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$ComponentSimple: 1,
  Ljapgolly_scalajs_react_component_Generic$ComponentSimple: 1,
  Ljapgolly_scalajs_react_component_Generic$ComponentRaw: 1,
  Ljapgolly_scalajs_react_component_Generic$ComponentWithRoot: 1
});
$c_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2.prototype.$classData = $d_Ljapgolly_scalajs_react_component_JsBaseComponentTemplate$$anon$2;
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_AbsUrl() {
  $c_Ljapgolly_scalajs_react_extra_router_PathLike.call(this);
  this.value$2 = null
}
$c_Ljapgolly_scalajs_react_extra_router_AbsUrl.prototype = new $h_Ljapgolly_scalajs_react_extra_router_PathLike();
$c_Ljapgolly_scalajs_react_extra_router_AbsUrl.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_AbsUrl;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_AbsUrl() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_AbsUrl.prototype = $c_Ljapgolly_scalajs_react_extra_router_AbsUrl.prototype;
$c_Ljapgolly_scalajs_react_extra_router_AbsUrl.prototype.productPrefix__T = (function() {
  return "AbsUrl"
});
$c_Ljapgolly_scalajs_react_extra_router_AbsUrl.prototype.productArity__I = (function() {
  return 1
});
$c_Ljapgolly_scalajs_react_extra_router_AbsUrl.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Ljapgolly_scalajs_react_extra_router_AbsUrl(x$1)) {
    var AbsUrl$1 = $as_Ljapgolly_scalajs_react_extra_router_AbsUrl(x$1);
    return (this.value$2 === AbsUrl$1.value$2)
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_extra_router_AbsUrl.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.value$2;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Ljapgolly_scalajs_react_extra_router_AbsUrl.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Ljapgolly_scalajs_react_extra_router_AbsUrl.prototype.str__Ljapgolly_scalajs_react_extra_router_PathLike__T = (function(s) {
  var s$1 = $as_Ljapgolly_scalajs_react_extra_router_AbsUrl(s);
  return s$1.value$2
});
$c_Ljapgolly_scalajs_react_extra_router_AbsUrl.prototype.init___T = (function(value) {
  this.value$2 = value;
  var thiz = this.value$2;
  if ((!($uI(thiz.indexOf("://")) !== (-1)))) {
    var jsx$1 = $m_Lorg_scalajs_dom_package$().console__Lorg_scalajs_dom_raw_Console();
    var s = new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["", " doesn't seem to be a valid URL. It's missing '://'. Consider using AbsUrl.fromWindow."])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([this]));
    jsx$1.warn(s)
  };
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_AbsUrl.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Ljapgolly_scalajs_react_extra_router_AbsUrl.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Ljapgolly_scalajs_react_extra_router_AbsUrl.prototype.make__T__Ljapgolly_scalajs_react_extra_router_PathLike = (function(s) {
  return new $c_Ljapgolly_scalajs_react_extra_router_AbsUrl().init___T(s)
});
function $is_Ljapgolly_scalajs_react_extra_router_AbsUrl(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_extra_router_AbsUrl)))
}
function $as_Ljapgolly_scalajs_react_extra_router_AbsUrl(obj) {
  return (($is_Ljapgolly_scalajs_react_extra_router_AbsUrl(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.extra.router.AbsUrl"))
}
function $isArrayOf_Ljapgolly_scalajs_react_extra_router_AbsUrl(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_extra_router_AbsUrl)))
}
function $asArrayOf_Ljapgolly_scalajs_react_extra_router_AbsUrl(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_extra_router_AbsUrl(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.extra.router.AbsUrl;", depth))
}
var $d_Ljapgolly_scalajs_react_extra_router_AbsUrl = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_AbsUrl: 0
}, false, "japgolly.scalajs.react.extra.router.AbsUrl", {
  Ljapgolly_scalajs_react_extra_router_AbsUrl: 1,
  Ljapgolly_scalajs_react_extra_router_PathLike: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_extra_router_AbsUrl.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_AbsUrl;
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_BaseUrl() {
  $c_Ljapgolly_scalajs_react_extra_router_PathLike.call(this);
  this.value$2 = null
}
$c_Ljapgolly_scalajs_react_extra_router_BaseUrl.prototype = new $h_Ljapgolly_scalajs_react_extra_router_PathLike();
$c_Ljapgolly_scalajs_react_extra_router_BaseUrl.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_BaseUrl;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_BaseUrl() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_BaseUrl.prototype = $c_Ljapgolly_scalajs_react_extra_router_BaseUrl.prototype;
$c_Ljapgolly_scalajs_react_extra_router_BaseUrl.prototype.productPrefix__T = (function() {
  return "BaseUrl"
});
$c_Ljapgolly_scalajs_react_extra_router_BaseUrl.prototype.productArity__I = (function() {
  return 1
});
$c_Ljapgolly_scalajs_react_extra_router_BaseUrl.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Ljapgolly_scalajs_react_extra_router_BaseUrl(x$1)) {
    var BaseUrl$1 = $as_Ljapgolly_scalajs_react_extra_router_BaseUrl(x$1);
    return (this.value$2 === BaseUrl$1.value$2)
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_extra_router_BaseUrl.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.value$2;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Ljapgolly_scalajs_react_extra_router_BaseUrl.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Ljapgolly_scalajs_react_extra_router_BaseUrl.prototype.str__Ljapgolly_scalajs_react_extra_router_PathLike__T = (function(s) {
  var s$1 = $as_Ljapgolly_scalajs_react_extra_router_BaseUrl(s);
  return s$1.value$2
});
$c_Ljapgolly_scalajs_react_extra_router_BaseUrl.prototype.init___T = (function(value) {
  this.value$2 = value;
  var thiz = this.value$2;
  if ((!($uI(thiz.indexOf("://")) !== (-1)))) {
    var jsx$1 = $m_Lorg_scalajs_dom_package$().console__Lorg_scalajs_dom_raw_Console();
    var s = new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["", " doesn't seem to be a valid URL. It's missing '://'. Consider using BaseUrl.fromWindowOrigin."])).s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([this]));
    jsx$1.warn(s)
  };
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_BaseUrl.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Ljapgolly_scalajs_react_extra_router_BaseUrl.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Ljapgolly_scalajs_react_extra_router_BaseUrl.prototype.apply__Ljapgolly_scalajs_react_extra_router_Path__Ljapgolly_scalajs_react_extra_router_AbsUrl = (function(p) {
  return new $c_Ljapgolly_scalajs_react_extra_router_AbsUrl().init___T((("" + this.value$2) + p.value$2))
});
$c_Ljapgolly_scalajs_react_extra_router_BaseUrl.prototype.make__T__Ljapgolly_scalajs_react_extra_router_PathLike = (function(s) {
  return new $c_Ljapgolly_scalajs_react_extra_router_BaseUrl().init___T(s)
});
function $is_Ljapgolly_scalajs_react_extra_router_BaseUrl(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_extra_router_BaseUrl)))
}
function $as_Ljapgolly_scalajs_react_extra_router_BaseUrl(obj) {
  return (($is_Ljapgolly_scalajs_react_extra_router_BaseUrl(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.extra.router.BaseUrl"))
}
function $isArrayOf_Ljapgolly_scalajs_react_extra_router_BaseUrl(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_extra_router_BaseUrl)))
}
function $asArrayOf_Ljapgolly_scalajs_react_extra_router_BaseUrl(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_extra_router_BaseUrl(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.extra.router.BaseUrl;", depth))
}
var $d_Ljapgolly_scalajs_react_extra_router_BaseUrl = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_BaseUrl: 0
}, false, "japgolly.scalajs.react.extra.router.BaseUrl", {
  Ljapgolly_scalajs_react_extra_router_BaseUrl: 1,
  Ljapgolly_scalajs_react_extra_router_PathLike: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_extra_router_BaseUrl.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_BaseUrl;
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_Path() {
  $c_Ljapgolly_scalajs_react_extra_router_PathLike.call(this);
  this.value$2 = null
}
$c_Ljapgolly_scalajs_react_extra_router_Path.prototype = new $h_Ljapgolly_scalajs_react_extra_router_PathLike();
$c_Ljapgolly_scalajs_react_extra_router_Path.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_Path;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_Path() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_Path.prototype = $c_Ljapgolly_scalajs_react_extra_router_Path.prototype;
$c_Ljapgolly_scalajs_react_extra_router_Path.prototype.productPrefix__T = (function() {
  return "Path"
});
$c_Ljapgolly_scalajs_react_extra_router_Path.prototype.productArity__I = (function() {
  return 1
});
$c_Ljapgolly_scalajs_react_extra_router_Path.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Ljapgolly_scalajs_react_extra_router_Path(x$1)) {
    var Path$1 = $as_Ljapgolly_scalajs_react_extra_router_Path(x$1);
    return (this.value$2 === Path$1.value$2)
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_extra_router_Path.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.value$2;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Ljapgolly_scalajs_react_extra_router_Path.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Ljapgolly_scalajs_react_extra_router_Path.prototype.str__Ljapgolly_scalajs_react_extra_router_PathLike__T = (function(s) {
  var s$1 = $as_Ljapgolly_scalajs_react_extra_router_Path(s);
  return s$1.value$2
});
$c_Ljapgolly_scalajs_react_extra_router_Path.prototype.init___T = (function(value) {
  this.value$2 = value;
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_Path.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Ljapgolly_scalajs_react_extra_router_Path.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Ljapgolly_scalajs_react_extra_router_Path.prototype.make__T__Ljapgolly_scalajs_react_extra_router_PathLike = (function(s) {
  return new $c_Ljapgolly_scalajs_react_extra_router_Path().init___T(s)
});
function $is_Ljapgolly_scalajs_react_extra_router_Path(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_extra_router_Path)))
}
function $as_Ljapgolly_scalajs_react_extra_router_Path(obj) {
  return (($is_Ljapgolly_scalajs_react_extra_router_Path(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.extra.router.Path"))
}
function $isArrayOf_Ljapgolly_scalajs_react_extra_router_Path(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_extra_router_Path)))
}
function $asArrayOf_Ljapgolly_scalajs_react_extra_router_Path(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_extra_router_Path(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.extra.router.Path;", depth))
}
var $d_Ljapgolly_scalajs_react_extra_router_Path = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_Path: 0
}, false, "japgolly.scalajs.react.extra.router.Path", {
  Ljapgolly_scalajs_react_extra_router_Path: 1,
  Ljapgolly_scalajs_react_extra_router_PathLike: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_extra_router_Path.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_Path;
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_Redirect$Push$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_extra_router_Redirect$Push$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_router_Redirect$Push$.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_Redirect$Push$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_Redirect$Push$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_Redirect$Push$.prototype = $c_Ljapgolly_scalajs_react_extra_router_Redirect$Push$.prototype;
$c_Ljapgolly_scalajs_react_extra_router_Redirect$Push$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_Redirect$Push$.prototype.productPrefix__T = (function() {
  return "Push"
});
$c_Ljapgolly_scalajs_react_extra_router_Redirect$Push$.prototype.productArity__I = (function() {
  return 0
});
$c_Ljapgolly_scalajs_react_extra_router_Redirect$Push$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Ljapgolly_scalajs_react_extra_router_Redirect$Push$.prototype.toString__T = (function() {
  return "Push"
});
$c_Ljapgolly_scalajs_react_extra_router_Redirect$Push$.prototype.hashCode__I = (function() {
  return 2499386
});
$c_Ljapgolly_scalajs_react_extra_router_Redirect$Push$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_Ljapgolly_scalajs_react_extra_router_Redirect$Push$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_Redirect$Push$: 0
}, false, "japgolly.scalajs.react.extra.router.Redirect$Push$", {
  Ljapgolly_scalajs_react_extra_router_Redirect$Push$: 1,
  O: 1,
  Ljapgolly_scalajs_react_extra_router_Redirect$Method: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_extra_router_Redirect$Push$.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_Redirect$Push$;
var $n_Ljapgolly_scalajs_react_extra_router_Redirect$Push$ = (void 0);
function $m_Ljapgolly_scalajs_react_extra_router_Redirect$Push$() {
  if ((!$n_Ljapgolly_scalajs_react_extra_router_Redirect$Push$)) {
    $n_Ljapgolly_scalajs_react_extra_router_Redirect$Push$ = new $c_Ljapgolly_scalajs_react_extra_router_Redirect$Push$().init___()
  };
  return $n_Ljapgolly_scalajs_react_extra_router_Redirect$Push$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_Redirect$Replace$() {
  $c_O.call(this)
}
$c_Ljapgolly_scalajs_react_extra_router_Redirect$Replace$.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_router_Redirect$Replace$.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_Redirect$Replace$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_Redirect$Replace$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_Redirect$Replace$.prototype = $c_Ljapgolly_scalajs_react_extra_router_Redirect$Replace$.prototype;
$c_Ljapgolly_scalajs_react_extra_router_Redirect$Replace$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_Redirect$Replace$.prototype.productPrefix__T = (function() {
  return "Replace"
});
$c_Ljapgolly_scalajs_react_extra_router_Redirect$Replace$.prototype.productArity__I = (function() {
  return 0
});
$c_Ljapgolly_scalajs_react_extra_router_Redirect$Replace$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Ljapgolly_scalajs_react_extra_router_Redirect$Replace$.prototype.toString__T = (function() {
  return "Replace"
});
$c_Ljapgolly_scalajs_react_extra_router_Redirect$Replace$.prototype.hashCode__I = (function() {
  return (-1535817068)
});
$c_Ljapgolly_scalajs_react_extra_router_Redirect$Replace$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_Ljapgolly_scalajs_react_extra_router_Redirect$Replace$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_Redirect$Replace$: 0
}, false, "japgolly.scalajs.react.extra.router.Redirect$Replace$", {
  Ljapgolly_scalajs_react_extra_router_Redirect$Replace$: 1,
  O: 1,
  Ljapgolly_scalajs_react_extra_router_Redirect$Method: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_extra_router_Redirect$Replace$.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_Redirect$Replace$;
var $n_Ljapgolly_scalajs_react_extra_router_Redirect$Replace$ = (void 0);
function $m_Ljapgolly_scalajs_react_extra_router_Redirect$Replace$() {
  if ((!$n_Ljapgolly_scalajs_react_extra_router_Redirect$Replace$)) {
    $n_Ljapgolly_scalajs_react_extra_router_Redirect$Replace$ = new $c_Ljapgolly_scalajs_react_extra_router_Redirect$Replace$().init___()
  };
  return $n_Ljapgolly_scalajs_react_extra_router_Redirect$Replace$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_Renderer() {
  $c_O.call(this);
  this.f$1 = null
}
$c_Ljapgolly_scalajs_react_extra_router_Renderer.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_router_Renderer.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_Renderer;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_Renderer() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_Renderer.prototype = $c_Ljapgolly_scalajs_react_extra_router_Renderer.prototype;
$c_Ljapgolly_scalajs_react_extra_router_Renderer.prototype.productPrefix__T = (function() {
  return "Renderer"
});
$c_Ljapgolly_scalajs_react_extra_router_Renderer.prototype.productArity__I = (function() {
  return 1
});
$c_Ljapgolly_scalajs_react_extra_router_Renderer.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Ljapgolly_scalajs_react_extra_router_Renderer(x$1)) {
    var Renderer$1 = $as_Ljapgolly_scalajs_react_extra_router_Renderer(x$1);
    var x = this.f$1;
    var x$2 = Renderer$1.f$1;
    return ((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_extra_router_Renderer.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.f$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Ljapgolly_scalajs_react_extra_router_Renderer.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Ljapgolly_scalajs_react_extra_router_Renderer.prototype.init___F1 = (function(f) {
  this.f$1 = f;
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_Renderer.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Ljapgolly_scalajs_react_extra_router_Renderer.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Ljapgolly_scalajs_react_extra_router_Renderer(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_extra_router_Renderer)))
}
function $as_Ljapgolly_scalajs_react_extra_router_Renderer(obj) {
  return (($is_Ljapgolly_scalajs_react_extra_router_Renderer(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.extra.router.Renderer"))
}
function $isArrayOf_Ljapgolly_scalajs_react_extra_router_Renderer(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_extra_router_Renderer)))
}
function $asArrayOf_Ljapgolly_scalajs_react_extra_router_Renderer(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_extra_router_Renderer(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.extra.router.Renderer;", depth))
}
var $d_Ljapgolly_scalajs_react_extra_router_Renderer = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_Renderer: 0
}, false, "japgolly.scalajs.react.extra.router.Renderer", {
  Ljapgolly_scalajs_react_extra_router_Renderer: 1,
  O: 1,
  Ljapgolly_scalajs_react_extra_router_Action: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_extra_router_Renderer.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_Renderer;
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_RouteCmd$BroadcastSync$() {
  $c_Ljapgolly_scalajs_react_extra_router_RouteCmd.call(this)
}
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$BroadcastSync$.prototype = new $h_Ljapgolly_scalajs_react_extra_router_RouteCmd();
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$BroadcastSync$.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_RouteCmd$BroadcastSync$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_RouteCmd$BroadcastSync$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_RouteCmd$BroadcastSync$.prototype = $c_Ljapgolly_scalajs_react_extra_router_RouteCmd$BroadcastSync$.prototype;
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$BroadcastSync$.prototype.init___ = (function() {
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$BroadcastSync$.prototype.productPrefix__T = (function() {
  return "BroadcastSync"
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$BroadcastSync$.prototype.productArity__I = (function() {
  return 0
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$BroadcastSync$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$BroadcastSync$.prototype.toString__T = (function() {
  return "BroadcastSync"
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$BroadcastSync$.prototype.hashCode__I = (function() {
  return (-155951396)
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$BroadcastSync$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_Ljapgolly_scalajs_react_extra_router_RouteCmd$BroadcastSync$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_RouteCmd$BroadcastSync$: 0
}, false, "japgolly.scalajs.react.extra.router.RouteCmd$BroadcastSync$", {
  Ljapgolly_scalajs_react_extra_router_RouteCmd$BroadcastSync$: 1,
  Ljapgolly_scalajs_react_extra_router_RouteCmd: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$BroadcastSync$.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_RouteCmd$BroadcastSync$;
var $n_Ljapgolly_scalajs_react_extra_router_RouteCmd$BroadcastSync$ = (void 0);
function $m_Ljapgolly_scalajs_react_extra_router_RouteCmd$BroadcastSync$() {
  if ((!$n_Ljapgolly_scalajs_react_extra_router_RouteCmd$BroadcastSync$)) {
    $n_Ljapgolly_scalajs_react_extra_router_RouteCmd$BroadcastSync$ = new $c_Ljapgolly_scalajs_react_extra_router_RouteCmd$BroadcastSync$().init___()
  };
  return $n_Ljapgolly_scalajs_react_extra_router_RouteCmd$BroadcastSync$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log() {
  $c_Ljapgolly_scalajs_react_extra_router_RouteCmd.call(this);
  this.msg$2 = null
}
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log.prototype = new $h_Ljapgolly_scalajs_react_extra_router_RouteCmd();
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log.prototype = $c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log.prototype;
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log.prototype.init___F0 = (function(msg) {
  this.msg$2 = msg;
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log.prototype.productPrefix__T = (function() {
  return "Log"
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log.prototype.productArity__I = (function() {
  return 1
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log(x$1)) {
    var Log$1 = $as_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log(x$1);
    var x = this.msg$2;
    var x$2 = Log$1.msg$2;
    return (x === x$2)
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.msg$2;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_extra_router_RouteCmd$Log)))
}
function $as_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log(obj) {
  return (($is_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.extra.router.RouteCmd$Log"))
}
function $isArrayOf_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_extra_router_RouteCmd$Log)))
}
function $asArrayOf_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.extra.router.RouteCmd$Log;", depth))
}
var $d_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_RouteCmd$Log: 0
}, false, "japgolly.scalajs.react.extra.router.RouteCmd$Log", {
  Ljapgolly_scalajs_react_extra_router_RouteCmd$Log: 1,
  Ljapgolly_scalajs_react_extra_router_RouteCmd: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_RouteCmd$Log;
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState() {
  $c_Ljapgolly_scalajs_react_extra_router_RouteCmd.call(this);
  this.url$2 = null
}
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState.prototype = new $h_Ljapgolly_scalajs_react_extra_router_RouteCmd();
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState.prototype = $c_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState.prototype;
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState.prototype.productPrefix__T = (function() {
  return "PushState"
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState.prototype.productArity__I = (function() {
  return 1
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState(x$1)) {
    var PushState$1 = $as_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState(x$1);
    var x = this.url$2;
    var x$2 = PushState$1.url$2;
    return ((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.url$2;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState.prototype.init___Ljapgolly_scalajs_react_extra_router_AbsUrl = (function(url) {
  this.url$2 = url;
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState)))
}
function $as_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState(obj) {
  return (($is_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.extra.router.RouteCmd$PushState"))
}
function $isArrayOf_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState)))
}
function $asArrayOf_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.extra.router.RouteCmd$PushState;", depth))
}
var $d_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState: 0
}, false, "japgolly.scalajs.react.extra.router.RouteCmd$PushState", {
  Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState: 1,
  Ljapgolly_scalajs_react_extra_router_RouteCmd: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_RouteCmd$PushState;
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState() {
  $c_Ljapgolly_scalajs_react_extra_router_RouteCmd.call(this);
  this.url$2 = null
}
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState.prototype = new $h_Ljapgolly_scalajs_react_extra_router_RouteCmd();
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState.prototype = $c_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState.prototype;
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState.prototype.productPrefix__T = (function() {
  return "ReplaceState"
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState.prototype.productArity__I = (function() {
  return 1
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState(x$1)) {
    var ReplaceState$1 = $as_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState(x$1);
    var x = this.url$2;
    var x$2 = ReplaceState$1.url$2;
    return ((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.url$2;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState.prototype.init___Ljapgolly_scalajs_react_extra_router_AbsUrl = (function(url) {
  this.url$2 = url;
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState)))
}
function $as_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState(obj) {
  return (($is_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.extra.router.RouteCmd$ReplaceState"))
}
function $isArrayOf_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState)))
}
function $asArrayOf_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.extra.router.RouteCmd$ReplaceState;", depth))
}
var $d_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState: 0
}, false, "japgolly.scalajs.react.extra.router.RouteCmd$ReplaceState", {
  Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState: 1,
  Ljapgolly_scalajs_react_extra_router_RouteCmd: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_RouteCmd$ReplaceState;
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return() {
  $c_Ljapgolly_scalajs_react_extra_router_RouteCmd.call(this);
  this.a$2 = null
}
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return.prototype = new $h_Ljapgolly_scalajs_react_extra_router_RouteCmd();
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return.prototype = $c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return.prototype;
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return.prototype.productPrefix__T = (function() {
  return "Return"
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return.prototype.productArity__I = (function() {
  return 1
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return(x$1)) {
    var Return$1 = $as_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return(x$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z(this.a$2, Return$1.a$2)
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.a$2;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return.prototype.init___O = (function(a) {
  this.a$2 = a;
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_extra_router_RouteCmd$Return)))
}
function $as_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return(obj) {
  return (($is_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.extra.router.RouteCmd$Return"))
}
function $isArrayOf_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_extra_router_RouteCmd$Return)))
}
function $asArrayOf_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.extra.router.RouteCmd$Return;", depth))
}
var $d_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_RouteCmd$Return: 0
}, false, "japgolly.scalajs.react.extra.router.RouteCmd$Return", {
  Ljapgolly_scalajs_react_extra_router_RouteCmd$Return: 1,
  Ljapgolly_scalajs_react_extra_router_RouteCmd: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_RouteCmd$Return;
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence() {
  $c_Ljapgolly_scalajs_react_extra_router_RouteCmd.call(this);
  this.init$2 = null;
  this.last$2 = null
}
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence.prototype = new $h_Ljapgolly_scalajs_react_extra_router_RouteCmd();
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence.prototype = $c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence.prototype;
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence.prototype.productPrefix__T = (function() {
  return "Sequence"
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence.prototype.productArity__I = (function() {
  return 2
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence(x$1)) {
    var Sequence$1 = $as_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence(x$1);
    var x = this.init$2;
    var x$2 = Sequence$1.init$2;
    if (((x === null) ? (x$2 === null) : $f_sc_GenSeqLike__equals__O__Z(x, x$2))) {
      var x$3 = this.last$2;
      var x$4 = Sequence$1.last$2;
      return ((x$3 === null) ? (x$4 === null) : x$3.equals__O__Z(x$4))
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.init$2;
      break
    }
    case 1: {
      return this.last$2;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence.prototype.init___sci_Vector__Ljapgolly_scalajs_react_extra_router_RouteCmd = (function(init, last) {
  this.init$2 = init;
  this.last$2 = last;
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence)))
}
function $as_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence(obj) {
  return (($is_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.extra.router.RouteCmd$Sequence"))
}
function $isArrayOf_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence)))
}
function $asArrayOf_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.extra.router.RouteCmd$Sequence;", depth))
}
var $d_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence: 0
}, false, "japgolly.scalajs.react.extra.router.RouteCmd$Sequence", {
  Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence: 1,
  Ljapgolly_scalajs_react_extra_router_RouteCmd: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_RouteCmd$Sequence;
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$$anonfun$1() {
  $c_sr_AbstractPartialFunction.call(this);
  this.page$1$2 = null
}
$c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$$anonfun$1.prototype = new $h_sr_AbstractPartialFunction();
$c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$$anonfun$1.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$$anonfun$1;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$$anonfun$1() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$$anonfun$1.prototype = $c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$$anonfun$1.prototype;
$c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$$anonfun$1.prototype.init___Ljapgolly_scalajs_react_extra_router_RouterConfigDsl__O = (function($$outer, page$1) {
  this.page$1$2 = page$1;
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$$anonfun$1.prototype.isDefinedAt__O__Z = (function(x1) {
  return $m_sr_BoxesRunTime$().equals__O__O__Z(this.page$1$2, x1)
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$$anonfun$1.prototype.applyOrElse__O__F1__O = (function(x1, $default) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(this.page$1$2, x1) ? x1 : $default.apply__O__O(x1))
});
var $d_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$$anonfun$1 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$$anonfun$1: 0
}, false, "japgolly.scalajs.react.extra.router.RouterConfigDsl$$anonfun$1", {
  Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$$anonfun$1: 1,
  sr_AbstractPartialFunction: 1,
  O: 1,
  F1: 1,
  s_PartialFunction: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$$anonfun$1.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_RouterConfigDsl$$anonfun$1;
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap() {
  $c_Ljapgolly_scalajs_react_extra_router_RouterCtl.call(this);
  this.u$2 = null;
  this.f$2 = null
}
$c_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap.prototype = new $h_Ljapgolly_scalajs_react_extra_router_RouterCtl();
$c_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap.prototype = $c_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap.prototype;
$c_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap.prototype.productPrefix__T = (function() {
  return "Contramap"
});
$c_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap.prototype.init___Ljapgolly_scalajs_react_extra_router_RouterCtl__F1 = (function(u, f) {
  this.u$2 = u;
  this.f$2 = f;
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap.prototype.productArity__I = (function() {
  return 2
});
$c_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap(x$1)) {
    var Contramap$1 = $as_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap(x$1);
    var x = this.u$2;
    var x$2 = Contramap$1.u$2;
    if (((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))) {
      var x$3 = this.f$2;
      var x$4 = Contramap$1.f$2;
      return ((x$3 === null) ? (x$4 === null) : x$3.equals__O__Z(x$4))
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.u$2;
      break
    }
    case 1: {
      return this.f$2;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap.prototype.refresh__F0 = (function() {
  return this.u$2.refresh__F0()
});
$c_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap)))
}
function $as_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap(obj) {
  return (($is_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.extra.router.RouterCtl$Contramap"))
}
function $isArrayOf_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap)))
}
function $asArrayOf_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.extra.router.RouterCtl$Contramap;", depth))
}
var $d_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap: 0
}, false, "japgolly.scalajs.react.extra.router.RouterCtl$Contramap", {
  Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap: 1,
  Ljapgolly_scalajs_react_extra_router_RouterCtl: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_RouterCtl$Contramap;
/** @constructor */
function $c_T2() {
  $c_O.call(this);
  this.$$und1$f = null;
  this.$$und2$f = null
}
$c_T2.prototype = new $h_O();
$c_T2.prototype.constructor = $c_T2;
/** @constructor */
function $h_T2() {
  /*<skip>*/
}
$h_T2.prototype = $c_T2.prototype;
$c_T2.prototype.productPrefix__T = (function() {
  return "Tuple2"
});
$c_T2.prototype.productArity__I = (function() {
  return 2
});
$c_T2.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_T2(x$1)) {
    var Tuple2$1 = $as_T2(x$1);
    return ($m_sr_BoxesRunTime$().equals__O__O__Z(this.$$und1$f, Tuple2$1.$$und1$f) && $m_sr_BoxesRunTime$().equals__O__O__Z(this.$$und2$f, Tuple2$1.$$und2$f))
  } else {
    return false
  }
});
$c_T2.prototype.init___O__O = (function(_1, _2) {
  this.$$und1$f = _1;
  this.$$und2$f = _2;
  return this
});
$c_T2.prototype.productElement__I__O = (function(n) {
  return $f_s_Product2__productElement__I__O(this, n)
});
$c_T2.prototype.toString__T = (function() {
  return (((("(" + this.$$und1$f) + ",") + this.$$und2$f) + ")")
});
$c_T2.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_T2.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_T2(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.T2)))
}
function $as_T2(obj) {
  return (($is_T2(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Tuple2"))
}
function $isArrayOf_T2(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T2)))
}
function $asArrayOf_T2(obj, depth) {
  return (($isArrayOf_T2(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Tuple2;", depth))
}
var $d_T2 = new $TypeData().initClass({
  T2: 0
}, false, "scala.Tuple2", {
  T2: 1,
  O: 1,
  s_Product2: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_T2.prototype.$classData = $d_T2;
/** @constructor */
function $c_jl_ArrayIndexOutOfBoundsException() {
  $c_jl_IndexOutOfBoundsException.call(this)
}
$c_jl_ArrayIndexOutOfBoundsException.prototype = new $h_jl_IndexOutOfBoundsException();
$c_jl_ArrayIndexOutOfBoundsException.prototype.constructor = $c_jl_ArrayIndexOutOfBoundsException;
/** @constructor */
function $h_jl_ArrayIndexOutOfBoundsException() {
  /*<skip>*/
}
$h_jl_ArrayIndexOutOfBoundsException.prototype = $c_jl_ArrayIndexOutOfBoundsException.prototype;
$c_jl_ArrayIndexOutOfBoundsException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_jl_ArrayIndexOutOfBoundsException = new $TypeData().initClass({
  jl_ArrayIndexOutOfBoundsException: 0
}, false, "java.lang.ArrayIndexOutOfBoundsException", {
  jl_ArrayIndexOutOfBoundsException: 1,
  jl_IndexOutOfBoundsException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_ArrayIndexOutOfBoundsException.prototype.$classData = $d_jl_ArrayIndexOutOfBoundsException;
/** @constructor */
function $c_jl_NumberFormatException() {
  $c_jl_IllegalArgumentException.call(this)
}
$c_jl_NumberFormatException.prototype = new $h_jl_IllegalArgumentException();
$c_jl_NumberFormatException.prototype.constructor = $c_jl_NumberFormatException;
/** @constructor */
function $h_jl_NumberFormatException() {
  /*<skip>*/
}
$h_jl_NumberFormatException.prototype = $c_jl_NumberFormatException.prototype;
$c_jl_NumberFormatException.prototype.init___T = (function(s) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
function $is_jl_NumberFormatException(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_NumberFormatException)))
}
function $as_jl_NumberFormatException(obj) {
  return (($is_jl_NumberFormatException(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "java.lang.NumberFormatException"))
}
function $isArrayOf_jl_NumberFormatException(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_NumberFormatException)))
}
function $asArrayOf_jl_NumberFormatException(obj, depth) {
  return (($isArrayOf_jl_NumberFormatException(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljava.lang.NumberFormatException;", depth))
}
var $d_jl_NumberFormatException = new $TypeData().initClass({
  jl_NumberFormatException: 0
}, false, "java.lang.NumberFormatException", {
  jl_NumberFormatException: 1,
  jl_IllegalArgumentException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_jl_NumberFormatException.prototype.$classData = $d_jl_NumberFormatException;
/** @constructor */
function $c_s_None$() {
  $c_s_Option.call(this)
}
$c_s_None$.prototype = new $h_s_Option();
$c_s_None$.prototype.constructor = $c_s_None$;
/** @constructor */
function $h_s_None$() {
  /*<skip>*/
}
$h_s_None$.prototype = $c_s_None$.prototype;
$c_s_None$.prototype.init___ = (function() {
  return this
});
$c_s_None$.prototype.productPrefix__T = (function() {
  return "None"
});
$c_s_None$.prototype.productArity__I = (function() {
  return 0
});
$c_s_None$.prototype.isEmpty__Z = (function() {
  return true
});
$c_s_None$.prototype.get__O = (function() {
  this.get__sr_Nothing$()
});
$c_s_None$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_s_None$.prototype.toString__T = (function() {
  return "None"
});
$c_s_None$.prototype.get__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("None.get")
});
$c_s_None$.prototype.hashCode__I = (function() {
  return 2433880
});
$c_s_None$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_s_None$ = new $TypeData().initClass({
  s_None$: 0
}, false, "scala.None$", {
  s_None$: 1,
  s_Option: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_None$.prototype.$classData = $d_s_None$;
var $n_s_None$ = (void 0);
function $m_s_None$() {
  if ((!$n_s_None$)) {
    $n_s_None$ = new $c_s_None$().init___()
  };
  return $n_s_None$
}
/** @constructor */
function $c_s_PartialFunction$$anonfun$1() {
  $c_sr_AbstractPartialFunction.call(this)
}
$c_s_PartialFunction$$anonfun$1.prototype = new $h_sr_AbstractPartialFunction();
$c_s_PartialFunction$$anonfun$1.prototype.constructor = $c_s_PartialFunction$$anonfun$1;
/** @constructor */
function $h_s_PartialFunction$$anonfun$1() {
  /*<skip>*/
}
$h_s_PartialFunction$$anonfun$1.prototype = $c_s_PartialFunction$$anonfun$1.prototype;
$c_s_PartialFunction$$anonfun$1.prototype.init___ = (function() {
  return this
});
$c_s_PartialFunction$$anonfun$1.prototype.isDefinedAt__O__Z = (function(x1) {
  return true
});
$c_s_PartialFunction$$anonfun$1.prototype.applyOrElse__O__F1__O = (function(x1, $default) {
  return $m_s_PartialFunction$().scala$PartialFunction$$fallback$undpf$f
});
var $d_s_PartialFunction$$anonfun$1 = new $TypeData().initClass({
  s_PartialFunction$$anonfun$1: 0
}, false, "scala.PartialFunction$$anonfun$1", {
  s_PartialFunction$$anonfun$1: 1,
  sr_AbstractPartialFunction: 1,
  O: 1,
  F1: 1,
  s_PartialFunction: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_PartialFunction$$anonfun$1.prototype.$classData = $d_s_PartialFunction$$anonfun$1;
/** @constructor */
function $c_s_Some() {
  $c_s_Option.call(this);
  this.value$2 = null
}
$c_s_Some.prototype = new $h_s_Option();
$c_s_Some.prototype.constructor = $c_s_Some;
/** @constructor */
function $h_s_Some() {
  /*<skip>*/
}
$h_s_Some.prototype = $c_s_Some.prototype;
$c_s_Some.prototype.productPrefix__T = (function() {
  return "Some"
});
$c_s_Some.prototype.productArity__I = (function() {
  return 1
});
$c_s_Some.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_s_Some(x$1)) {
    var Some$1 = $as_s_Some(x$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z(this.value$2, Some$1.value$2)
  } else {
    return false
  }
});
$c_s_Some.prototype.isEmpty__Z = (function() {
  return false
});
$c_s_Some.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.value$2;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_s_Some.prototype.get__O = (function() {
  return this.value$2
});
$c_s_Some.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_s_Some.prototype.init___O = (function(value) {
  this.value$2 = value;
  return this
});
$c_s_Some.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_s_Some.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_s_Some(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_Some)))
}
function $as_s_Some(obj) {
  return (($is_s_Some(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.Some"))
}
function $isArrayOf_s_Some(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_Some)))
}
function $asArrayOf_s_Some(obj, depth) {
  return (($isArrayOf_s_Some(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.Some;", depth))
}
var $d_s_Some = new $TypeData().initClass({
  s_Some: 0
}, false, "scala.Some", {
  s_Some: 1,
  s_Option: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_Some.prototype.$classData = $d_s_Some;
/** @constructor */
function $c_s_StringContext$InvalidEscapeException() {
  $c_jl_IllegalArgumentException.call(this);
  this.index$5 = 0
}
$c_s_StringContext$InvalidEscapeException.prototype = new $h_jl_IllegalArgumentException();
$c_s_StringContext$InvalidEscapeException.prototype.constructor = $c_s_StringContext$InvalidEscapeException;
/** @constructor */
function $h_s_StringContext$InvalidEscapeException() {
  /*<skip>*/
}
$h_s_StringContext$InvalidEscapeException.prototype = $c_s_StringContext$InvalidEscapeException.prototype;
$c_s_StringContext$InvalidEscapeException.prototype.init___T__I = (function(str, index) {
  this.index$5 = index;
  var jsx$3 = new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["invalid escape ", " index ", " in \"", "\". Use \\\\\\\\ for literal \\\\."]));
  $m_s_Predef$().require__Z__V(((index >= 0) && (index < $uI(str.length))));
  if ((index === (((-1) + $uI(str.length)) | 0))) {
    var jsx$1 = "at terminal"
  } else {
    var jsx$2 = new $c_s_StringContext().init___sc_Seq(new $c_sjs_js_WrappedArray().init___sjs_js_Array(["'\\\\", "' not one of ", " at"]));
    var index$1 = ((1 + index) | 0);
    var c = (65535 & $uI(str.charCodeAt(index$1)));
    var jsx$1 = jsx$2.s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([new $c_jl_Character().init___C(c), "[\\b, \\t, \\n, \\f, \\r, \\\\, \\\", \\']"]))
  };
  var s = jsx$3.s__sc_Seq__T(new $c_sjs_js_WrappedArray().init___sjs_js_Array([jsx$1, index, str]));
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
var $d_s_StringContext$InvalidEscapeException = new $TypeData().initClass({
  s_StringContext$InvalidEscapeException: 0
}, false, "scala.StringContext$InvalidEscapeException", {
  s_StringContext$InvalidEscapeException: 1,
  jl_IllegalArgumentException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
$c_s_StringContext$InvalidEscapeException.prototype.$classData = $d_s_StringContext$InvalidEscapeException;
/** @constructor */
function $c_s_util_Left() {
  $c_s_util_Either.call(this);
  this.value$2 = null
}
$c_s_util_Left.prototype = new $h_s_util_Either();
$c_s_util_Left.prototype.constructor = $c_s_util_Left;
/** @constructor */
function $h_s_util_Left() {
  /*<skip>*/
}
$h_s_util_Left.prototype = $c_s_util_Left.prototype;
$c_s_util_Left.prototype.productPrefix__T = (function() {
  return "Left"
});
$c_s_util_Left.prototype.productArity__I = (function() {
  return 1
});
$c_s_util_Left.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_s_util_Left(x$1)) {
    var Left$1 = $as_s_util_Left(x$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z(this.value$2, Left$1.value$2)
  } else {
    return false
  }
});
$c_s_util_Left.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.value$2;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_s_util_Left.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_s_util_Left.prototype.init___O = (function(value) {
  this.value$2 = value;
  return this
});
$c_s_util_Left.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_s_util_Left.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_s_util_Left(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_util_Left)))
}
function $as_s_util_Left(obj) {
  return (($is_s_util_Left(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.util.Left"))
}
function $isArrayOf_s_util_Left(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_util_Left)))
}
function $asArrayOf_s_util_Left(obj, depth) {
  return (($isArrayOf_s_util_Left(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.util.Left;", depth))
}
var $d_s_util_Left = new $TypeData().initClass({
  s_util_Left: 0
}, false, "scala.util.Left", {
  s_util_Left: 1,
  s_util_Either: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Left.prototype.$classData = $d_s_util_Left;
/** @constructor */
function $c_s_util_Right() {
  $c_s_util_Either.call(this);
  this.value$2 = null
}
$c_s_util_Right.prototype = new $h_s_util_Either();
$c_s_util_Right.prototype.constructor = $c_s_util_Right;
/** @constructor */
function $h_s_util_Right() {
  /*<skip>*/
}
$h_s_util_Right.prototype = $c_s_util_Right.prototype;
$c_s_util_Right.prototype.productPrefix__T = (function() {
  return "Right"
});
$c_s_util_Right.prototype.productArity__I = (function() {
  return 1
});
$c_s_util_Right.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_s_util_Right(x$1)) {
    var Right$1 = $as_s_util_Right(x$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z(this.value$2, Right$1.value$2)
  } else {
    return false
  }
});
$c_s_util_Right.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.value$2;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_s_util_Right.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_s_util_Right.prototype.init___O = (function(value) {
  this.value$2 = value;
  return this
});
$c_s_util_Right.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_s_util_Right.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_s_util_Right(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_util_Right)))
}
function $as_s_util_Right(obj) {
  return (($is_s_util_Right(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.util.Right"))
}
function $isArrayOf_s_util_Right(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_util_Right)))
}
function $asArrayOf_s_util_Right(obj, depth) {
  return (($isArrayOf_s_util_Right(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.util.Right;", depth))
}
var $d_s_util_Right = new $TypeData().initClass({
  s_util_Right: 0
}, false, "scala.util.Right", {
  s_util_Right: 1,
  s_util_Either: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_s_util_Right.prototype.$classData = $d_s_util_Right;
function $f_sc_GenSetLike__equals__O__Z($thiz, that) {
  if ($is_sc_GenSet(that)) {
    var x2 = $as_sc_GenSet(that);
    return (($thiz === x2) || (($thiz.size__I() === x2.size__I()) && $f_sc_GenSetLike__liftedTree1$1__psc_GenSetLike__sc_GenSet__Z($thiz, x2)))
  } else {
    return false
  }
}
function $f_sc_GenSetLike__liftedTree1$1__psc_GenSetLike__sc_GenSet__Z($thiz, x2$1) {
  try {
    return $thiz.subsetOf__sc_GenSet__Z(x2$1)
  } catch (e) {
    if ($is_jl_ClassCastException(e)) {
      $as_jl_ClassCastException(e);
      return false
    } else {
      throw e
    }
  }
}
function $f_sc_TraversableLike__to__scg_CanBuildFrom__O($thiz, cbf) {
  var b = cbf.apply__scm_Builder();
  $f_scm_Builder__sizeHint__sc_TraversableLike__V(b, $thiz);
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($thiz.thisCollection__sc_Traversable());
  return b.result__O()
}
function $f_sc_TraversableLike__flatMap__F1__scg_CanBuildFrom__O($thiz, f, bf) {
  var b = bf.apply__O__scm_Builder($thiz.repr__O());
  $thiz.foreach__F1__V(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, f$1, b$1) {
    return (function(x$2) {
      return $as_scm_Builder(b$1.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($as_sc_GenTraversableOnce(f$1.apply__O__O(x$2)).seq__sc_TraversableOnce()))
    })
  })($thiz, f, b)));
  return b.result__O()
}
function $f_sc_TraversableLike__isPartLikelySynthetic$1__psc_TraversableLike__T__I__Z($thiz, fqn$1, partStart$1) {
  var firstChar = (65535 & $uI(fqn$1.charCodeAt(partStart$1)));
  return (((firstChar > 90) && (firstChar < 127)) || (firstChar < 65))
}
function $f_sc_TraversableLike__toString__T($thiz) {
  return $thiz.mkString__T__T__T__T(($thiz.stringPrefix__T() + "("), ", ", ")")
}
function $f_sc_TraversableLike__stringPrefix__T($thiz) {
  var this$1 = $thiz.repr__O();
  var fqn = $objectGetClass(this$1).getName__T();
  var pos = (((-1) + $uI(fqn.length)) | 0);
  while (true) {
    if ((pos !== (-1))) {
      var index = pos;
      var jsx$1 = ((65535 & $uI(fqn.charCodeAt(index))) === 36)
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      pos = (((-1) + pos) | 0)
    } else {
      break
    }
  };
  if ((pos === (-1))) {
    var jsx$2 = true
  } else {
    var index$1 = pos;
    var jsx$2 = ((65535 & $uI(fqn.charCodeAt(index$1))) === 46)
  };
  if (jsx$2) {
    return ""
  };
  var result = "";
  while (true) {
    var partEnd = ((1 + pos) | 0);
    while (true) {
      if ((pos !== (-1))) {
        var index$2 = pos;
        var jsx$4 = ((65535 & $uI(fqn.charCodeAt(index$2))) <= 57)
      } else {
        var jsx$4 = false
      };
      if (jsx$4) {
        var index$3 = pos;
        var jsx$3 = ((65535 & $uI(fqn.charCodeAt(index$3))) >= 48)
      } else {
        var jsx$3 = false
      };
      if (jsx$3) {
        pos = (((-1) + pos) | 0)
      } else {
        break
      }
    };
    var lastNonDigit = pos;
    while (true) {
      if ((pos !== (-1))) {
        var index$4 = pos;
        var jsx$6 = ((65535 & $uI(fqn.charCodeAt(index$4))) !== 36)
      } else {
        var jsx$6 = false
      };
      if (jsx$6) {
        var index$5 = pos;
        var jsx$5 = ((65535 & $uI(fqn.charCodeAt(index$5))) !== 46)
      } else {
        var jsx$5 = false
      };
      if (jsx$5) {
        pos = (((-1) + pos) | 0)
      } else {
        break
      }
    };
    var partStart = ((1 + pos) | 0);
    if (((pos === lastNonDigit) && (partEnd !== $uI(fqn.length)))) {
      return result
    };
    while (true) {
      if ((pos !== (-1))) {
        var index$6 = pos;
        var jsx$7 = ((65535 & $uI(fqn.charCodeAt(index$6))) === 36)
      } else {
        var jsx$7 = false
      };
      if (jsx$7) {
        pos = (((-1) + pos) | 0)
      } else {
        break
      }
    };
    if ((pos === (-1))) {
      var atEnd = true
    } else {
      var index$7 = pos;
      var atEnd = ((65535 & $uI(fqn.charCodeAt(index$7))) === 46)
    };
    if ((atEnd || (!$f_sc_TraversableLike__isPartLikelySynthetic$1__psc_TraversableLike__T__I__Z($thiz, fqn, partStart)))) {
      var part = $as_T(fqn.substring(partStart, partEnd));
      var thiz = result;
      if ((thiz === null)) {
        throw new $c_jl_NullPointerException().init___()
      };
      if ((thiz === "")) {
        result = part
      } else {
        result = ((("" + part) + new $c_jl_Character().init___C(46)) + result)
      };
      if (atEnd) {
        return result
      }
    }
  }
}
/** @constructor */
function $c_scg_SeqFactory() {
  $c_scg_GenSeqFactory.call(this)
}
$c_scg_SeqFactory.prototype = new $h_scg_GenSeqFactory();
$c_scg_SeqFactory.prototype.constructor = $c_scg_SeqFactory;
/** @constructor */
function $h_scg_SeqFactory() {
  /*<skip>*/
}
$h_scg_SeqFactory.prototype = $c_scg_SeqFactory.prototype;
/** @constructor */
function $c_sci_HashSet$HashTrieSet$$anon$1() {
  $c_sci_TrieIterator.call(this)
}
$c_sci_HashSet$HashTrieSet$$anon$1.prototype = new $h_sci_TrieIterator();
$c_sci_HashSet$HashTrieSet$$anon$1.prototype.constructor = $c_sci_HashSet$HashTrieSet$$anon$1;
/** @constructor */
function $h_sci_HashSet$HashTrieSet$$anon$1() {
  /*<skip>*/
}
$h_sci_HashSet$HashTrieSet$$anon$1.prototype = $c_sci_HashSet$HashTrieSet$$anon$1.prototype;
$c_sci_HashSet$HashTrieSet$$anon$1.prototype.init___sci_HashSet$HashTrieSet = (function($$outer) {
  $c_sci_TrieIterator.prototype.init___Asci_Iterable.call(this, $$outer.elems$5);
  return this
});
var $d_sci_HashSet$HashTrieSet$$anon$1 = new $TypeData().initClass({
  sci_HashSet$HashTrieSet$$anon$1: 0
}, false, "scala.collection.immutable.HashSet$HashTrieSet$$anon$1", {
  sci_HashSet$HashTrieSet$$anon$1: 1,
  sci_TrieIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
$c_sci_HashSet$HashTrieSet$$anon$1.prototype.$classData = $d_sci_HashSet$HashTrieSet$$anon$1;
/** @constructor */
function $c_sci_Set$() {
  $c_scg_ImmutableSetFactory.call(this)
}
$c_sci_Set$.prototype = new $h_scg_ImmutableSetFactory();
$c_sci_Set$.prototype.constructor = $c_sci_Set$;
/** @constructor */
function $h_sci_Set$() {
  /*<skip>*/
}
$h_sci_Set$.prototype = $c_sci_Set$.prototype;
$c_sci_Set$.prototype.init___ = (function() {
  return this
});
$c_sci_Set$.prototype.emptyInstance__sci_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
var $d_sci_Set$ = new $TypeData().initClass({
  sci_Set$: 0
}, false, "scala.collection.immutable.Set$", {
  sci_Set$: 1,
  scg_ImmutableSetFactory: 1,
  scg_SetFactory: 1,
  scg_GenSetFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Set$.prototype.$classData = $d_sci_Set$;
var $n_sci_Set$ = (void 0);
function $m_sci_Set$() {
  if ((!$n_sci_Set$)) {
    $n_sci_Set$ = new $c_sci_Set$().init___()
  };
  return $n_sci_Set$
}
/** @constructor */
function $c_sci_Stream$StreamBuilder() {
  $c_scm_LazyBuilder.call(this)
}
$c_sci_Stream$StreamBuilder.prototype = new $h_scm_LazyBuilder();
$c_sci_Stream$StreamBuilder.prototype.constructor = $c_sci_Stream$StreamBuilder;
/** @constructor */
function $h_sci_Stream$StreamBuilder() {
  /*<skip>*/
}
$h_sci_Stream$StreamBuilder.prototype = $c_sci_Stream$StreamBuilder.prototype;
$c_sci_Stream$StreamBuilder.prototype.init___ = (function() {
  $c_scm_LazyBuilder.prototype.init___.call(this);
  return this
});
$c_sci_Stream$StreamBuilder.prototype.result__O = (function() {
  return this.result__sci_Stream()
});
$c_sci_Stream$StreamBuilder.prototype.result__sci_Stream = (function() {
  var this$1 = this.parts$1;
  return $as_sci_Stream(this$1.scala$collection$mutable$ListBuffer$$start$6.toStream__sci_Stream().flatMap__F1__scg_CanBuildFrom__O(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this) {
    return (function(x$5$2) {
      var x$5 = $as_sc_TraversableOnce(x$5$2);
      return x$5.toStream__sci_Stream()
    })
  })(this)), ($m_sci_Stream$(), new $c_sci_Stream$StreamCanBuildFrom().init___())))
});
function $is_sci_Stream$StreamBuilder(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Stream$StreamBuilder)))
}
function $as_sci_Stream$StreamBuilder(obj) {
  return (($is_sci_Stream$StreamBuilder(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Stream$StreamBuilder"))
}
function $isArrayOf_sci_Stream$StreamBuilder(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Stream$StreamBuilder)))
}
function $asArrayOf_sci_Stream$StreamBuilder(obj, depth) {
  return (($isArrayOf_sci_Stream$StreamBuilder(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Stream$StreamBuilder;", depth))
}
var $d_sci_Stream$StreamBuilder = new $TypeData().initClass({
  sci_Stream$StreamBuilder: 0
}, false, "scala.collection.immutable.Stream$StreamBuilder", {
  sci_Stream$StreamBuilder: 1,
  scm_LazyBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_sci_Stream$StreamBuilder.prototype.$classData = $d_sci_Stream$StreamBuilder;
/** @constructor */
function $c_sci_VectorBuilder() {
  $c_O.call(this);
  this.blockIndex$1 = 0;
  this.lo$1 = 0;
  this.depth$1 = 0;
  this.display0$1 = null;
  this.display1$1 = null;
  this.display2$1 = null;
  this.display3$1 = null;
  this.display4$1 = null;
  this.display5$1 = null
}
$c_sci_VectorBuilder.prototype = new $h_O();
$c_sci_VectorBuilder.prototype.constructor = $c_sci_VectorBuilder;
/** @constructor */
function $h_sci_VectorBuilder() {
  /*<skip>*/
}
$h_sci_VectorBuilder.prototype = $c_sci_VectorBuilder.prototype;
$c_sci_VectorBuilder.prototype.display3__AO = (function() {
  return this.display3$1
});
$c_sci_VectorBuilder.prototype.init___ = (function() {
  this.display0$1 = $newArrayObject($d_O.getArrayOf(), [32]);
  this.depth$1 = 1;
  this.blockIndex$1 = 0;
  this.lo$1 = 0;
  return this
});
$c_sci_VectorBuilder.prototype.depth__I = (function() {
  return this.depth$1
});
$c_sci_VectorBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__sci_VectorBuilder(elem)
});
$c_sci_VectorBuilder.prototype.display5$und$eq__AO__V = (function(x$1) {
  this.display5$1 = x$1
});
$c_sci_VectorBuilder.prototype.display0__AO = (function() {
  return this.display0$1
});
$c_sci_VectorBuilder.prototype.display2$und$eq__AO__V = (function(x$1) {
  this.display2$1 = x$1
});
$c_sci_VectorBuilder.prototype.display4__AO = (function() {
  return this.display4$1
});
$c_sci_VectorBuilder.prototype.$$plus$eq__O__sci_VectorBuilder = (function(elem) {
  if ((this.lo$1 >= this.display0$1.u.length)) {
    var newBlockIndex = ((32 + this.blockIndex$1) | 0);
    var xor = (this.blockIndex$1 ^ newBlockIndex);
    $f_sci_VectorPointer__gotoNextBlockStartWritable__I__I__V(this, newBlockIndex, xor);
    this.blockIndex$1 = newBlockIndex;
    this.lo$1 = 0
  };
  this.display0$1.set(this.lo$1, elem);
  this.lo$1 = ((1 + this.lo$1) | 0);
  return this
});
$c_sci_VectorBuilder.prototype.result__O = (function() {
  return this.result__sci_Vector()
});
$c_sci_VectorBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_sci_VectorBuilder.prototype.display1$und$eq__AO__V = (function(x$1) {
  this.display1$1 = x$1
});
$c_sci_VectorBuilder.prototype.display4$und$eq__AO__V = (function(x$1) {
  this.display4$1 = x$1
});
$c_sci_VectorBuilder.prototype.display1__AO = (function() {
  return this.display1$1
});
$c_sci_VectorBuilder.prototype.display5__AO = (function() {
  return this.display5$1
});
$c_sci_VectorBuilder.prototype.result__sci_Vector = (function() {
  var size = ((this.blockIndex$1 + this.lo$1) | 0);
  if ((size === 0)) {
    var this$1 = $m_sci_Vector$();
    return this$1.NIL$6
  };
  var s = new $c_sci_Vector().init___I__I__I(0, size, 0);
  var depth = this.depth$1;
  $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V(s, this, depth);
  if ((this.depth$1 > 1)) {
    var xor = (((-1) + size) | 0);
    $f_sci_VectorPointer__gotoPos__I__I__V(s, 0, xor)
  };
  return s
});
$c_sci_VectorBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__sci_VectorBuilder(elem)
});
$c_sci_VectorBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_sci_VectorBuilder.prototype.depth$und$eq__I__V = (function(x$1) {
  this.depth$1 = x$1
});
$c_sci_VectorBuilder.prototype.display2__AO = (function() {
  return this.display2$1
});
$c_sci_VectorBuilder.prototype.display0$und$eq__AO__V = (function(x$1) {
  this.display0$1 = x$1
});
$c_sci_VectorBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $as_sci_VectorBuilder($f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs))
});
$c_sci_VectorBuilder.prototype.display3$und$eq__AO__V = (function(x$1) {
  this.display3$1 = x$1
});
function $is_sci_VectorBuilder(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_VectorBuilder)))
}
function $as_sci_VectorBuilder(obj) {
  return (($is_sci_VectorBuilder(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.VectorBuilder"))
}
function $isArrayOf_sci_VectorBuilder(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_VectorBuilder)))
}
function $asArrayOf_sci_VectorBuilder(obj, depth) {
  return (($isArrayOf_sci_VectorBuilder(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.VectorBuilder;", depth))
}
var $d_sci_VectorBuilder = new $TypeData().initClass({
  sci_VectorBuilder: 0
}, false, "scala.collection.immutable.VectorBuilder", {
  sci_VectorBuilder: 1,
  O: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  sci_VectorPointer: 1
});
$c_sci_VectorBuilder.prototype.$classData = $d_sci_VectorBuilder;
/** @constructor */
function $c_sci_VectorIterator() {
  $c_sc_AbstractIterator.call(this);
  this.endIndex$2 = 0;
  this.blockIndex$2 = 0;
  this.lo$2 = 0;
  this.endLo$2 = 0;
  this.$$undhasNext$2 = false;
  this.depth$2 = 0;
  this.display0$2 = null;
  this.display1$2 = null;
  this.display2$2 = null;
  this.display3$2 = null;
  this.display4$2 = null;
  this.display5$2 = null
}
$c_sci_VectorIterator.prototype = new $h_sc_AbstractIterator();
$c_sci_VectorIterator.prototype.constructor = $c_sci_VectorIterator;
/** @constructor */
function $h_sci_VectorIterator() {
  /*<skip>*/
}
$h_sci_VectorIterator.prototype = $c_sci_VectorIterator.prototype;
$c_sci_VectorIterator.prototype.next__O = (function() {
  if ((!this.$$undhasNext$2)) {
    throw new $c_ju_NoSuchElementException().init___T("reached iterator end")
  };
  var res = this.display0$2.get(this.lo$2);
  this.lo$2 = ((1 + this.lo$2) | 0);
  if ((this.lo$2 === this.endLo$2)) {
    if ((((this.blockIndex$2 + this.lo$2) | 0) < this.endIndex$2)) {
      var newBlockIndex = ((32 + this.blockIndex$2) | 0);
      var xor = (this.blockIndex$2 ^ newBlockIndex);
      $f_sci_VectorPointer__gotoNextBlockStart__I__I__V(this, newBlockIndex, xor);
      this.blockIndex$2 = newBlockIndex;
      var x = ((this.endIndex$2 - this.blockIndex$2) | 0);
      this.endLo$2 = ((x < 32) ? x : 32);
      this.lo$2 = 0
    } else {
      this.$$undhasNext$2 = false
    }
  };
  return res
});
$c_sci_VectorIterator.prototype.display3__AO = (function() {
  return this.display3$2
});
$c_sci_VectorIterator.prototype.depth__I = (function() {
  return this.depth$2
});
$c_sci_VectorIterator.prototype.display5$und$eq__AO__V = (function(x$1) {
  this.display5$2 = x$1
});
$c_sci_VectorIterator.prototype.init___I__I = (function(_startIndex, endIndex) {
  this.endIndex$2 = endIndex;
  this.blockIndex$2 = ((-32) & _startIndex);
  this.lo$2 = (31 & _startIndex);
  var x = ((endIndex - this.blockIndex$2) | 0);
  this.endLo$2 = ((x < 32) ? x : 32);
  this.$$undhasNext$2 = (((this.blockIndex$2 + this.lo$2) | 0) < endIndex);
  return this
});
$c_sci_VectorIterator.prototype.display0__AO = (function() {
  return this.display0$2
});
$c_sci_VectorIterator.prototype.display2$und$eq__AO__V = (function(x$1) {
  this.display2$2 = x$1
});
$c_sci_VectorIterator.prototype.display4__AO = (function() {
  return this.display4$2
});
$c_sci_VectorIterator.prototype.display1$und$eq__AO__V = (function(x$1) {
  this.display1$2 = x$1
});
$c_sci_VectorIterator.prototype.hasNext__Z = (function() {
  return this.$$undhasNext$2
});
$c_sci_VectorIterator.prototype.display4$und$eq__AO__V = (function(x$1) {
  this.display4$2 = x$1
});
$c_sci_VectorIterator.prototype.display1__AO = (function() {
  return this.display1$2
});
$c_sci_VectorIterator.prototype.display5__AO = (function() {
  return this.display5$2
});
$c_sci_VectorIterator.prototype.depth$und$eq__I__V = (function(x$1) {
  this.depth$2 = x$1
});
$c_sci_VectorIterator.prototype.display2__AO = (function() {
  return this.display2$2
});
$c_sci_VectorIterator.prototype.display0$und$eq__AO__V = (function(x$1) {
  this.display0$2 = x$1
});
$c_sci_VectorIterator.prototype.display3$und$eq__AO__V = (function(x$1) {
  this.display3$2 = x$1
});
var $d_sci_VectorIterator = new $TypeData().initClass({
  sci_VectorIterator: 0
}, false, "scala.collection.immutable.VectorIterator", {
  sci_VectorIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sci_VectorPointer: 1
});
$c_sci_VectorIterator.prototype.$classData = $d_sci_VectorIterator;
/** @constructor */
function $c_sjsr_UndefinedBehaviorError() {
  $c_jl_Error.call(this)
}
$c_sjsr_UndefinedBehaviorError.prototype = new $h_jl_Error();
$c_sjsr_UndefinedBehaviorError.prototype.constructor = $c_sjsr_UndefinedBehaviorError;
/** @constructor */
function $h_sjsr_UndefinedBehaviorError() {
  /*<skip>*/
}
$h_sjsr_UndefinedBehaviorError.prototype = $c_sjsr_UndefinedBehaviorError.prototype;
$c_sjsr_UndefinedBehaviorError.prototype.fillInStackTrace__jl_Throwable = (function() {
  return $c_jl_Throwable.prototype.fillInStackTrace__jl_Throwable.call(this)
});
$c_sjsr_UndefinedBehaviorError.prototype.init___jl_Throwable = (function(cause) {
  $c_sjsr_UndefinedBehaviorError.prototype.init___T__jl_Throwable.call(this, ("An undefined behavior was detected" + ((cause === null) ? "" : (": " + cause.getMessage__T()))), cause);
  return this
});
$c_sjsr_UndefinedBehaviorError.prototype.init___T__jl_Throwable = (function(message, cause) {
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, message, cause);
  return this
});
var $d_sjsr_UndefinedBehaviorError = new $TypeData().initClass({
  sjsr_UndefinedBehaviorError: 0
}, false, "scala.scalajs.runtime.UndefinedBehaviorError", {
  sjsr_UndefinedBehaviorError: 1,
  jl_Error: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_util_control_ControlThrowable: 1,
  s_util_control_NoStackTrace: 1
});
$c_sjsr_UndefinedBehaviorError.prototype.$classData = $d_sjsr_UndefinedBehaviorError;
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_RedirectToPage() {
  $c_O.call(this);
  this.page$1 = null;
  this.method$1 = null
}
$c_Ljapgolly_scalajs_react_extra_router_RedirectToPage.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_router_RedirectToPage.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_RedirectToPage;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_RedirectToPage() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_RedirectToPage.prototype = $c_Ljapgolly_scalajs_react_extra_router_RedirectToPage.prototype;
$c_Ljapgolly_scalajs_react_extra_router_RedirectToPage.prototype.productPrefix__T = (function() {
  return "RedirectToPage"
});
$c_Ljapgolly_scalajs_react_extra_router_RedirectToPage.prototype.productArity__I = (function() {
  return 2
});
$c_Ljapgolly_scalajs_react_extra_router_RedirectToPage.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Ljapgolly_scalajs_react_extra_router_RedirectToPage(x$1)) {
    var RedirectToPage$1 = $as_Ljapgolly_scalajs_react_extra_router_RedirectToPage(x$1);
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(this.page$1, RedirectToPage$1.page$1)) {
      var x = this.method$1;
      var x$2 = RedirectToPage$1.method$1;
      return (x === x$2)
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_extra_router_RedirectToPage.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.page$1;
      break
    }
    case 1: {
      return this.method$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Ljapgolly_scalajs_react_extra_router_RedirectToPage.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Ljapgolly_scalajs_react_extra_router_RedirectToPage.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Ljapgolly_scalajs_react_extra_router_RedirectToPage.prototype.init___O__Ljapgolly_scalajs_react_extra_router_Redirect$Method = (function(page, method) {
  this.page$1 = page;
  this.method$1 = method;
  return this
});
$c_Ljapgolly_scalajs_react_extra_router_RedirectToPage.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_Ljapgolly_scalajs_react_extra_router_RedirectToPage(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_extra_router_RedirectToPage)))
}
function $as_Ljapgolly_scalajs_react_extra_router_RedirectToPage(obj) {
  return (($is_Ljapgolly_scalajs_react_extra_router_RedirectToPage(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.extra.router.RedirectToPage"))
}
function $isArrayOf_Ljapgolly_scalajs_react_extra_router_RedirectToPage(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_extra_router_RedirectToPage)))
}
function $asArrayOf_Ljapgolly_scalajs_react_extra_router_RedirectToPage(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_extra_router_RedirectToPage(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.extra.router.RedirectToPage;", depth))
}
var $d_Ljapgolly_scalajs_react_extra_router_RedirectToPage = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_RedirectToPage: 0
}, false, "japgolly.scalajs.react.extra.router.RedirectToPage", {
  Ljapgolly_scalajs_react_extra_router_RedirectToPage: 1,
  O: 1,
  Ljapgolly_scalajs_react_extra_router_Redirect: 1,
  Ljapgolly_scalajs_react_extra_router_Action: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_extra_router_RedirectToPage.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_RedirectToPage;
/** @constructor */
function $c_Ljapgolly_scalajs_react_extra_router_RedirectToPath() {
  $c_O.call(this);
  this.path$1 = null;
  this.method$1 = null
}
$c_Ljapgolly_scalajs_react_extra_router_RedirectToPath.prototype = new $h_O();
$c_Ljapgolly_scalajs_react_extra_router_RedirectToPath.prototype.constructor = $c_Ljapgolly_scalajs_react_extra_router_RedirectToPath;
/** @constructor */
function $h_Ljapgolly_scalajs_react_extra_router_RedirectToPath() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_extra_router_RedirectToPath.prototype = $c_Ljapgolly_scalajs_react_extra_router_RedirectToPath.prototype;
$c_Ljapgolly_scalajs_react_extra_router_RedirectToPath.prototype.productPrefix__T = (function() {
  return "RedirectToPath"
});
$c_Ljapgolly_scalajs_react_extra_router_RedirectToPath.prototype.productArity__I = (function() {
  return 2
});
$c_Ljapgolly_scalajs_react_extra_router_RedirectToPath.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_Ljapgolly_scalajs_react_extra_router_RedirectToPath(x$1)) {
    var RedirectToPath$1 = $as_Ljapgolly_scalajs_react_extra_router_RedirectToPath(x$1);
    var x = this.path$1;
    var x$2 = RedirectToPath$1.path$1;
    if (((x === null) ? (x$2 === null) : x.equals__O__Z(x$2))) {
      var x$3 = this.method$1;
      var x$4 = RedirectToPath$1.method$1;
      return (x$3 === x$4)
    } else {
      return false
    }
  } else {
    return false
  }
});
$c_Ljapgolly_scalajs_react_extra_router_RedirectToPath.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.path$1;
      break
    }
    case 1: {
      return this.method$1;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_Ljapgolly_scalajs_react_extra_router_RedirectToPath.prototype.toString__T = (function() {
  return $m_sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
$c_Ljapgolly_scalajs_react_extra_router_RedirectToPath.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_Ljapgolly_scalajs_react_extra_router_RedirectToPath.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
$c_Ljapgolly_scalajs_react_extra_router_RedirectToPath.prototype.init___Ljapgolly_scalajs_react_extra_router_Path__Ljapgolly_scalajs_react_extra_router_Redirect$Method = (function(path, method) {
  this.path$1 = path;
  this.method$1 = method;
  return this
});
function $is_Ljapgolly_scalajs_react_extra_router_RedirectToPath(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljapgolly_scalajs_react_extra_router_RedirectToPath)))
}
function $as_Ljapgolly_scalajs_react_extra_router_RedirectToPath(obj) {
  return (($is_Ljapgolly_scalajs_react_extra_router_RedirectToPath(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "japgolly.scalajs.react.extra.router.RedirectToPath"))
}
function $isArrayOf_Ljapgolly_scalajs_react_extra_router_RedirectToPath(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljapgolly_scalajs_react_extra_router_RedirectToPath)))
}
function $asArrayOf_Ljapgolly_scalajs_react_extra_router_RedirectToPath(obj, depth) {
  return (($isArrayOf_Ljapgolly_scalajs_react_extra_router_RedirectToPath(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Ljapgolly.scalajs.react.extra.router.RedirectToPath;", depth))
}
var $d_Ljapgolly_scalajs_react_extra_router_RedirectToPath = new $TypeData().initClass({
  Ljapgolly_scalajs_react_extra_router_RedirectToPath: 0
}, false, "japgolly.scalajs.react.extra.router.RedirectToPath", {
  Ljapgolly_scalajs_react_extra_router_RedirectToPath: 1,
  O: 1,
  Ljapgolly_scalajs_react_extra_router_Redirect: 1,
  Ljapgolly_scalajs_react_extra_router_Action: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_Ljapgolly_scalajs_react_extra_router_RedirectToPath.prototype.$classData = $d_Ljapgolly_scalajs_react_extra_router_RedirectToPath;
/** @constructor */
function $c_sc_Seq$() {
  $c_scg_SeqFactory.call(this)
}
$c_sc_Seq$.prototype = new $h_scg_SeqFactory();
$c_sc_Seq$.prototype.constructor = $c_sc_Seq$;
/** @constructor */
function $h_sc_Seq$() {
  /*<skip>*/
}
$h_sc_Seq$.prototype = $c_sc_Seq$.prototype;
$c_sc_Seq$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sc_Seq$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_Seq$();
  return new $c_scm_ListBuffer().init___()
});
var $d_sc_Seq$ = new $TypeData().initClass({
  sc_Seq$: 0
}, false, "scala.collection.Seq$", {
  sc_Seq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_Seq$.prototype.$classData = $d_sc_Seq$;
var $n_sc_Seq$ = (void 0);
function $m_sc_Seq$() {
  if ((!$n_sc_Seq$)) {
    $n_sc_Seq$ = new $c_sc_Seq$().init___()
  };
  return $n_sc_Seq$
}
/** @constructor */
function $c_scg_IndexedSeqFactory() {
  $c_scg_SeqFactory.call(this)
}
$c_scg_IndexedSeqFactory.prototype = new $h_scg_SeqFactory();
$c_scg_IndexedSeqFactory.prototype.constructor = $c_scg_IndexedSeqFactory;
/** @constructor */
function $h_scg_IndexedSeqFactory() {
  /*<skip>*/
}
$h_scg_IndexedSeqFactory.prototype = $c_scg_IndexedSeqFactory.prototype;
/** @constructor */
function $c_sci_Seq$() {
  $c_scg_SeqFactory.call(this)
}
$c_sci_Seq$.prototype = new $h_scg_SeqFactory();
$c_sci_Seq$.prototype.constructor = $c_sci_Seq$;
/** @constructor */
function $h_sci_Seq$() {
  /*<skip>*/
}
$h_sci_Seq$.prototype = $c_sci_Seq$.prototype;
$c_sci_Seq$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sci_Seq$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ListBuffer().init___()
});
var $d_sci_Seq$ = new $TypeData().initClass({
  sci_Seq$: 0
}, false, "scala.collection.immutable.Seq$", {
  sci_Seq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_Seq$.prototype.$classData = $d_sci_Seq$;
var $n_sci_Seq$ = (void 0);
function $m_sci_Seq$() {
  if ((!$n_sci_Seq$)) {
    $n_sci_Seq$ = new $c_sci_Seq$().init___()
  };
  return $n_sci_Seq$
}
/** @constructor */
function $c_scm_IndexedSeq$() {
  $c_scg_SeqFactory.call(this)
}
$c_scm_IndexedSeq$.prototype = new $h_scg_SeqFactory();
$c_scm_IndexedSeq$.prototype.constructor = $c_scm_IndexedSeq$;
/** @constructor */
function $h_scm_IndexedSeq$() {
  /*<skip>*/
}
$h_scm_IndexedSeq$.prototype = $c_scm_IndexedSeq$.prototype;
$c_scm_IndexedSeq$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_scm_IndexedSeq$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ArrayBuffer().init___()
});
var $d_scm_IndexedSeq$ = new $TypeData().initClass({
  scm_IndexedSeq$: 0
}, false, "scala.collection.mutable.IndexedSeq$", {
  scm_IndexedSeq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_scm_IndexedSeq$.prototype.$classData = $d_scm_IndexedSeq$;
var $n_scm_IndexedSeq$ = (void 0);
function $m_scm_IndexedSeq$() {
  if ((!$n_scm_IndexedSeq$)) {
    $n_scm_IndexedSeq$ = new $c_scm_IndexedSeq$().init___()
  };
  return $n_scm_IndexedSeq$
}
/** @constructor */
function $c_sjs_js_WrappedArray$() {
  $c_scg_SeqFactory.call(this)
}
$c_sjs_js_WrappedArray$.prototype = new $h_scg_SeqFactory();
$c_sjs_js_WrappedArray$.prototype.constructor = $c_sjs_js_WrappedArray$;
/** @constructor */
function $h_sjs_js_WrappedArray$() {
  /*<skip>*/
}
$h_sjs_js_WrappedArray$.prototype = $c_sjs_js_WrappedArray$.prototype;
$c_sjs_js_WrappedArray$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sjs_js_WrappedArray$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_sjs_js_WrappedArray().init___()
});
var $d_sjs_js_WrappedArray$ = new $TypeData().initClass({
  sjs_js_WrappedArray$: 0
}, false, "scala.scalajs.js.WrappedArray$", {
  sjs_js_WrappedArray$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sjs_js_WrappedArray$.prototype.$classData = $d_sjs_js_WrappedArray$;
var $n_sjs_js_WrappedArray$ = (void 0);
function $m_sjs_js_WrappedArray$() {
  if ((!$n_sjs_js_WrappedArray$)) {
    $n_sjs_js_WrappedArray$ = new $c_sjs_js_WrappedArray$().init___()
  };
  return $n_sjs_js_WrappedArray$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_Js$$anon$1() {
  $c_Ljapgolly_scalajs_react_component_Template$MountedWithRoot.call(this);
  this.raw$2 = null
}
$c_Ljapgolly_scalajs_react_component_Js$$anon$1.prototype = new $h_Ljapgolly_scalajs_react_component_Template$MountedWithRoot();
$c_Ljapgolly_scalajs_react_component_Js$$anon$1.prototype.constructor = $c_Ljapgolly_scalajs_react_component_Js$$anon$1;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_Js$$anon$1() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_Js$$anon$1.prototype = $c_Ljapgolly_scalajs_react_component_Js$$anon$1.prototype;
$c_Ljapgolly_scalajs_react_component_Js$$anon$1.prototype.setState__sjs_js_Object__F0__V = (function(state, callback) {
  this.raw$2.setState(state, $m_Ljapgolly_scalajs_react_CallbackTo$().toJsFn$extension__F0__sjs_js_Function0(callback))
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$1.prototype.raw__Ljapgolly_scalajs_react_raw_package$ReactComponent = (function() {
  return this.raw$2
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$1.prototype.init___Ljapgolly_scalajs_react_raw_package$ReactComponent = (function(r$2) {
  $c_Ljapgolly_scalajs_react_component_Template$MountedWithRoot.prototype.init___Ljapgolly_scalajs_react_internal_Effect$Trans.call(this, $m_Ljapgolly_scalajs_react_internal_Effect$Trans$().endoId$1);
  this.raw$2 = r$2;
  return this
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$1.prototype.modState__F1__F0__V = (function(mod, callback) {
  this.raw$2.setState((function(f) {
    return (function(arg1) {
      return f.apply__O__O(arg1)
    })
  })(mod), $m_Ljapgolly_scalajs_react_CallbackTo$().toJsFn$extension__F0__sjs_js_Function0(callback))
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$1.prototype.mapped__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans__Ljapgolly_scalajs_react_component_Generic$MountedWithRoot = (function(mp, ls, ft) {
  $m_Ljapgolly_scalajs_react_component_Js$();
  return new $c_Ljapgolly_scalajs_react_component_Js$$anon$2().init___Ljapgolly_scalajs_react_component_Js$MountedWithRoot__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans(this, mp, ls, ft)
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$1.prototype.props__sjs_js_Object = (function() {
  return this.raw$2.props
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$1.prototype.props__O = (function() {
  return this.props__sjs_js_Object()
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$1.prototype.modState__F1__F0__O = (function(mod, callback) {
  this.modState__F1__F0__V(mod, callback)
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$1.prototype.setState__O__F0__O = (function(newState, callback) {
  this.setState__sjs_js_Object__F0__V(newState, callback)
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$1.prototype.state__O = (function() {
  return this.state__sjs_js_Object()
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$1.prototype.state__sjs_js_Object = (function() {
  return this.raw$2.state
});
var $d_Ljapgolly_scalajs_react_component_Js$$anon$1 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_Js$$anon$1: 0
}, false, "japgolly.scalajs.react.component.Js$$anon$1", {
  Ljapgolly_scalajs_react_component_Js$$anon$1: 1,
  Ljapgolly_scalajs_react_component_Template$MountedWithRoot: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_Generic$MountedWithRoot: 1,
  Ljapgolly_scalajs_react_component_Generic$MountedSimple: 1,
  Ljapgolly_scalajs_react_component_Generic$MountedRaw: 1,
  Ljapgolly_scalajs_react_StateAccess: 1,
  Ljapgolly_scalajs_react_component_Js$MountedWithRoot: 1,
  Ljapgolly_scalajs_react_component_Js$MountedSimple: 1
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$1.prototype.$classData = $d_Ljapgolly_scalajs_react_component_Js$$anon$1;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_Js$$anon$2() {
  $c_Ljapgolly_scalajs_react_component_Template$MountedMapped.call(this);
  this.raw$2 = null;
  this.from$2$2 = null;
  this.ft$1$2 = null
}
$c_Ljapgolly_scalajs_react_component_Js$$anon$2.prototype = new $h_Ljapgolly_scalajs_react_component_Template$MountedMapped();
$c_Ljapgolly_scalajs_react_component_Js$$anon$2.prototype.constructor = $c_Ljapgolly_scalajs_react_component_Js$$anon$2;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_Js$$anon$2() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_Js$$anon$2.prototype = $c_Ljapgolly_scalajs_react_component_Js$$anon$2.prototype;
$c_Ljapgolly_scalajs_react_component_Js$$anon$2.prototype.raw__Ljapgolly_scalajs_react_raw_package$ReactComponent = (function() {
  return this.raw$2
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$2.prototype.init___Ljapgolly_scalajs_react_component_Js$MountedWithRoot__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans = (function(from$2, mp$2, ls$1, ft$1) {
  this.from$2$2 = from$2;
  this.ft$1$2 = ft$1;
  $c_Ljapgolly_scalajs_react_component_Template$MountedMapped.prototype.init___Ljapgolly_scalajs_react_component_Generic$MountedWithRoot__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans.call(this, from$2, mp$2, ls$1, ft$1);
  this.raw$2 = from$2.raw__Ljapgolly_scalajs_react_raw_package$ReactComponent();
  return this
});
var $d_Ljapgolly_scalajs_react_component_Js$$anon$2 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_Js$$anon$2: 0
}, false, "japgolly.scalajs.react.component.Js$$anon$2", {
  Ljapgolly_scalajs_react_component_Js$$anon$2: 1,
  Ljapgolly_scalajs_react_component_Template$MountedMapped: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_Generic$MountedWithRoot: 1,
  Ljapgolly_scalajs_react_component_Generic$MountedSimple: 1,
  Ljapgolly_scalajs_react_component_Generic$MountedRaw: 1,
  Ljapgolly_scalajs_react_StateAccess: 1,
  Ljapgolly_scalajs_react_component_Js$MountedWithRoot: 1,
  Ljapgolly_scalajs_react_component_Js$MountedSimple: 1
});
$c_Ljapgolly_scalajs_react_component_Js$$anon$2.prototype.$classData = $d_Ljapgolly_scalajs_react_component_Js$$anon$2;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_Scala$$anon$1() {
  $c_Ljapgolly_scalajs_react_component_Template$MountedWithRoot.call(this);
  this.js$2 = null;
  this.raw$2 = null;
  this.x$1$2 = null
}
$c_Ljapgolly_scalajs_react_component_Scala$$anon$1.prototype = new $h_Ljapgolly_scalajs_react_component_Template$MountedWithRoot();
$c_Ljapgolly_scalajs_react_component_Scala$$anon$1.prototype.constructor = $c_Ljapgolly_scalajs_react_component_Scala$$anon$1;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_Scala$$anon$1() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_Scala$$anon$1.prototype = $c_Ljapgolly_scalajs_react_component_Scala$$anon$1.prototype;
$c_Ljapgolly_scalajs_react_component_Scala$$anon$1.prototype.js__Ljapgolly_scalajs_react_component_Js$MountedWithRoot = (function() {
  return this.js$2
});
$c_Ljapgolly_scalajs_react_component_Scala$$anon$1.prototype.raw__Ljapgolly_scalajs_react_raw_package$ReactComponent = (function() {
  return this.raw$2
});
$c_Ljapgolly_scalajs_react_component_Scala$$anon$1.prototype.modState__F1__F0__V = (function(mod, callback) {
  this.x$1$2.modState__F1__F0__O(new $c_sjsr_AnonFunction1().init___sjs_js_Function1((function($this, mod$1) {
    return (function(s$2) {
      $m_Ljapgolly_scalajs_react_internal_Box$();
      var value = mod$1.apply__O__O(s$2.a);
      return {
        "a": value
      }
    })
  })(this, mod)), callback)
});
$c_Ljapgolly_scalajs_react_component_Scala$$anon$1.prototype.setState__O__F0__V = (function(newState, callback) {
  this.x$1$2.setState__O__F0__O(($m_Ljapgolly_scalajs_react_internal_Box$(), {
    "a": newState
  }), callback)
});
$c_Ljapgolly_scalajs_react_component_Scala$$anon$1.prototype.mapped__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans__Ljapgolly_scalajs_react_component_Generic$MountedWithRoot = (function(mp, ls, ft) {
  $m_Ljapgolly_scalajs_react_component_Scala$();
  return new $c_Ljapgolly_scalajs_react_component_Scala$$anon$2().init___Ljapgolly_scalajs_react_component_Scala$MountedWithRoot__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans(this, mp, ls, ft)
});
$c_Ljapgolly_scalajs_react_component_Scala$$anon$1.prototype.props__O = (function() {
  return this.x$1$2.props__O().a
});
$c_Ljapgolly_scalajs_react_component_Scala$$anon$1.prototype.modState__F1__F0__O = (function(mod, callback) {
  this.modState__F1__F0__V(mod, callback)
});
$c_Ljapgolly_scalajs_react_component_Scala$$anon$1.prototype.setState__O__F0__O = (function(newState, callback) {
  this.setState__O__F0__V(newState, callback)
});
$c_Ljapgolly_scalajs_react_component_Scala$$anon$1.prototype.state__O = (function() {
  return this.x$1$2.state__O().a
});
$c_Ljapgolly_scalajs_react_component_Scala$$anon$1.prototype.init___Ljapgolly_scalajs_react_component_Js$MountedWithRoot = (function(x$1) {
  this.x$1$2 = x$1;
  $c_Ljapgolly_scalajs_react_component_Template$MountedWithRoot.prototype.init___Ljapgolly_scalajs_react_internal_Effect$Trans.call(this, $m_Ljapgolly_scalajs_react_internal_Effect$Trans$().endoId$1);
  this.js$2 = x$1;
  this.raw$2 = x$1.raw__Ljapgolly_scalajs_react_raw_package$ReactComponent();
  return this
});
var $d_Ljapgolly_scalajs_react_component_Scala$$anon$1 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_Scala$$anon$1: 0
}, false, "japgolly.scalajs.react.component.Scala$$anon$1", {
  Ljapgolly_scalajs_react_component_Scala$$anon$1: 1,
  Ljapgolly_scalajs_react_component_Template$MountedWithRoot: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_Generic$MountedWithRoot: 1,
  Ljapgolly_scalajs_react_component_Generic$MountedSimple: 1,
  Ljapgolly_scalajs_react_component_Generic$MountedRaw: 1,
  Ljapgolly_scalajs_react_StateAccess: 1,
  Ljapgolly_scalajs_react_component_Scala$MountedWithRoot: 1,
  Ljapgolly_scalajs_react_component_Scala$MountedSimple: 1
});
$c_Ljapgolly_scalajs_react_component_Scala$$anon$1.prototype.$classData = $d_Ljapgolly_scalajs_react_component_Scala$$anon$1;
/** @constructor */
function $c_Ljapgolly_scalajs_react_component_Scala$$anon$2() {
  $c_Ljapgolly_scalajs_react_component_Template$MountedMapped.call(this);
  this.js$2 = null;
  this.raw$2 = null;
  this.from$1$2 = null;
  this.ft$1$2 = null
}
$c_Ljapgolly_scalajs_react_component_Scala$$anon$2.prototype = new $h_Ljapgolly_scalajs_react_component_Template$MountedMapped();
$c_Ljapgolly_scalajs_react_component_Scala$$anon$2.prototype.constructor = $c_Ljapgolly_scalajs_react_component_Scala$$anon$2;
/** @constructor */
function $h_Ljapgolly_scalajs_react_component_Scala$$anon$2() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_component_Scala$$anon$2.prototype = $c_Ljapgolly_scalajs_react_component_Scala$$anon$2.prototype;
$c_Ljapgolly_scalajs_react_component_Scala$$anon$2.prototype.js__Ljapgolly_scalajs_react_component_Js$MountedWithRoot = (function() {
  return this.js$2
});
$c_Ljapgolly_scalajs_react_component_Scala$$anon$2.prototype.init___Ljapgolly_scalajs_react_component_Scala$MountedWithRoot__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans = (function(from$1, mp$1, ls$1, ft$1) {
  this.from$1$2 = from$1;
  this.ft$1$2 = ft$1;
  $c_Ljapgolly_scalajs_react_component_Template$MountedMapped.prototype.init___Ljapgolly_scalajs_react_component_Generic$MountedWithRoot__F1__Ljapgolly_scalajs_react_internal_Lens__Ljapgolly_scalajs_react_internal_Effect$Trans.call(this, from$1, mp$1, ls$1, ft$1);
  this.js$2 = from$1.js__Ljapgolly_scalajs_react_component_Js$MountedWithRoot();
  this.raw$2 = from$1.raw__Ljapgolly_scalajs_react_raw_package$ReactComponent();
  return this
});
$c_Ljapgolly_scalajs_react_component_Scala$$anon$2.prototype.raw__Ljapgolly_scalajs_react_raw_package$ReactComponent = (function() {
  return this.raw$2
});
var $d_Ljapgolly_scalajs_react_component_Scala$$anon$2 = new $TypeData().initClass({
  Ljapgolly_scalajs_react_component_Scala$$anon$2: 0
}, false, "japgolly.scalajs.react.component.Scala$$anon$2", {
  Ljapgolly_scalajs_react_component_Scala$$anon$2: 1,
  Ljapgolly_scalajs_react_component_Template$MountedMapped: 1,
  O: 1,
  Ljapgolly_scalajs_react_component_Generic$MountedWithRoot: 1,
  Ljapgolly_scalajs_react_component_Generic$MountedSimple: 1,
  Ljapgolly_scalajs_react_component_Generic$MountedRaw: 1,
  Ljapgolly_scalajs_react_StateAccess: 1,
  Ljapgolly_scalajs_react_component_Scala$MountedWithRoot: 1,
  Ljapgolly_scalajs_react_component_Scala$MountedSimple: 1
});
$c_Ljapgolly_scalajs_react_component_Scala$$anon$2.prototype.$classData = $d_Ljapgolly_scalajs_react_component_Scala$$anon$2;
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_PackageBase() {
  $c_Ljapgolly_scalajs_react_vdom_Exports.call(this);
  this.vdomAttrVtBoolean$2 = null;
  this.vdomAttrVtString$2 = null;
  this.vdomAttrVtInt$2 = null;
  this.vdomAttrVtJsObject$2 = null;
  this.vdomAttrVtInnerHtml$2 = null;
  this.vdomAttrVtKeyL$2 = null;
  this.vdomAttrVtKeyS$2 = null;
  this.bitmap$0$2 = false
}
$c_Ljapgolly_scalajs_react_vdom_PackageBase.prototype = new $h_Ljapgolly_scalajs_react_vdom_Exports();
$c_Ljapgolly_scalajs_react_vdom_PackageBase.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_PackageBase;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_PackageBase() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_PackageBase.prototype = $c_Ljapgolly_scalajs_react_vdom_PackageBase.prototype;
/** @constructor */
function $c_s_reflect_AnyValManifest() {
  $c_O.call(this);
  this.toString$1 = null
}
$c_s_reflect_AnyValManifest.prototype = new $h_O();
$c_s_reflect_AnyValManifest.prototype.constructor = $c_s_reflect_AnyValManifest;
/** @constructor */
function $h_s_reflect_AnyValManifest() {
  /*<skip>*/
}
$h_s_reflect_AnyValManifest.prototype = $c_s_reflect_AnyValManifest.prototype;
$c_s_reflect_AnyValManifest.prototype.equals__O__Z = (function(that) {
  return (this === that)
});
$c_s_reflect_AnyValManifest.prototype.toString__T = (function() {
  return this.toString$1
});
$c_s_reflect_AnyValManifest.prototype.hashCode__I = (function() {
  return $systemIdentityHashCode(this)
});
/** @constructor */
function $c_s_reflect_ManifestFactory$ClassTypeManifest() {
  $c_O.call(this);
  this.prefix$1 = null;
  this.runtimeClass1$1 = null;
  this.typeArguments$1 = null
}
$c_s_reflect_ManifestFactory$ClassTypeManifest.prototype = new $h_O();
$c_s_reflect_ManifestFactory$ClassTypeManifest.prototype.constructor = $c_s_reflect_ManifestFactory$ClassTypeManifest;
/** @constructor */
function $h_s_reflect_ManifestFactory$ClassTypeManifest() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$ClassTypeManifest.prototype = $c_s_reflect_ManifestFactory$ClassTypeManifest.prototype;
/** @constructor */
function $c_sc_IndexedSeq$() {
  $c_scg_IndexedSeqFactory.call(this);
  this.ReusableCBF$6 = null
}
$c_sc_IndexedSeq$.prototype = new $h_scg_IndexedSeqFactory();
$c_sc_IndexedSeq$.prototype.constructor = $c_sc_IndexedSeq$;
/** @constructor */
function $h_sc_IndexedSeq$() {
  /*<skip>*/
}
$h_sc_IndexedSeq$.prototype = $c_sc_IndexedSeq$.prototype;
$c_sc_IndexedSeq$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  $n_sc_IndexedSeq$ = this;
  this.ReusableCBF$6 = new $c_sc_IndexedSeq$$anon$1().init___();
  return this
});
$c_sc_IndexedSeq$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_IndexedSeq$();
  $m_sci_Vector$();
  return new $c_sci_VectorBuilder().init___()
});
var $d_sc_IndexedSeq$ = new $TypeData().initClass({
  sc_IndexedSeq$: 0
}, false, "scala.collection.IndexedSeq$", {
  sc_IndexedSeq$: 1,
  scg_IndexedSeqFactory: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sc_IndexedSeq$.prototype.$classData = $d_sc_IndexedSeq$;
var $n_sc_IndexedSeq$ = (void 0);
function $m_sc_IndexedSeq$() {
  if ((!$n_sc_IndexedSeq$)) {
    $n_sc_IndexedSeq$ = new $c_sc_IndexedSeq$().init___()
  };
  return $n_sc_IndexedSeq$
}
/** @constructor */
function $c_sc_IndexedSeqLike$Elements() {
  $c_sc_AbstractIterator.call(this);
  this.end$2 = 0;
  this.index$2 = 0;
  this.$$outer$2 = null
}
$c_sc_IndexedSeqLike$Elements.prototype = new $h_sc_AbstractIterator();
$c_sc_IndexedSeqLike$Elements.prototype.constructor = $c_sc_IndexedSeqLike$Elements;
/** @constructor */
function $h_sc_IndexedSeqLike$Elements() {
  /*<skip>*/
}
$h_sc_IndexedSeqLike$Elements.prototype = $c_sc_IndexedSeqLike$Elements.prototype;
$c_sc_IndexedSeqLike$Elements.prototype.next__O = (function() {
  if ((this.index$2 >= this.end$2)) {
    $m_sc_Iterator$().empty$1.next__O()
  };
  var x = this.$$outer$2.apply__I__O(this.index$2);
  this.index$2 = ((1 + this.index$2) | 0);
  return x
});
$c_sc_IndexedSeqLike$Elements.prototype.init___sc_IndexedSeqLike__I__I = (function($$outer, start, end) {
  this.end$2 = end;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  this.index$2 = start;
  return this
});
$c_sc_IndexedSeqLike$Elements.prototype.hasNext__Z = (function() {
  return (this.index$2 < this.end$2)
});
var $d_sc_IndexedSeqLike$Elements = new $TypeData().initClass({
  sc_IndexedSeqLike$Elements: 0
}, false, "scala.collection.IndexedSeqLike$Elements", {
  sc_IndexedSeqLike$Elements: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_BufferedIterator: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sc_IndexedSeqLike$Elements.prototype.$classData = $d_sc_IndexedSeqLike$Elements;
/** @constructor */
function $c_sci_HashSet$() {
  $c_scg_ImmutableSetFactory.call(this)
}
$c_sci_HashSet$.prototype = new $h_scg_ImmutableSetFactory();
$c_sci_HashSet$.prototype.constructor = $c_sci_HashSet$;
/** @constructor */
function $h_sci_HashSet$() {
  /*<skip>*/
}
$h_sci_HashSet$.prototype = $c_sci_HashSet$.prototype;
$c_sci_HashSet$.prototype.init___ = (function() {
  return this
});
$c_sci_HashSet$.prototype.scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet = (function(hash0, elem0, hash1, elem1, level) {
  var index0 = (31 & ((hash0 >>> level) | 0));
  var index1 = (31 & ((hash1 >>> level) | 0));
  if ((index0 !== index1)) {
    var bitmap = ((1 << index0) | (1 << index1));
    var elems = $newArrayObject($d_sci_HashSet.getArrayOf(), [2]);
    if ((index0 < index1)) {
      elems.set(0, elem0);
      elems.set(1, elem1)
    } else {
      elems.set(0, elem1);
      elems.set(1, elem0)
    };
    return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(bitmap, elems, ((elem0.size__I() + elem1.size__I()) | 0))
  } else {
    var elems$2 = $newArrayObject($d_sci_HashSet.getArrayOf(), [1]);
    var bitmap$2 = (1 << index0);
    var child = this.scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet(hash0, elem0, hash1, elem1, ((5 + level) | 0));
    elems$2.set(0, child);
    return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(bitmap$2, elems$2, child.size0$5)
  }
});
$c_sci_HashSet$.prototype.emptyInstance__sci_Set = (function() {
  return $m_sci_HashSet$EmptyHashSet$()
});
var $d_sci_HashSet$ = new $TypeData().initClass({
  sci_HashSet$: 0
}, false, "scala.collection.immutable.HashSet$", {
  sci_HashSet$: 1,
  scg_ImmutableSetFactory: 1,
  scg_SetFactory: 1,
  scg_GenSetFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$.prototype.$classData = $d_sci_HashSet$;
var $n_sci_HashSet$ = (void 0);
function $m_sci_HashSet$() {
  if ((!$n_sci_HashSet$)) {
    $n_sci_HashSet$ = new $c_sci_HashSet$().init___()
  };
  return $n_sci_HashSet$
}
/** @constructor */
function $c_sci_IndexedSeq$() {
  $c_scg_IndexedSeqFactory.call(this)
}
$c_sci_IndexedSeq$.prototype = new $h_scg_IndexedSeqFactory();
$c_sci_IndexedSeq$.prototype.constructor = $c_sci_IndexedSeq$;
/** @constructor */
function $h_sci_IndexedSeq$() {
  /*<skip>*/
}
$h_sci_IndexedSeq$.prototype = $c_sci_IndexedSeq$.prototype;
$c_sci_IndexedSeq$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sci_IndexedSeq$.prototype.newBuilder__scm_Builder = (function() {
  $m_sci_Vector$();
  return new $c_sci_VectorBuilder().init___()
});
var $d_sci_IndexedSeq$ = new $TypeData().initClass({
  sci_IndexedSeq$: 0
}, false, "scala.collection.immutable.IndexedSeq$", {
  sci_IndexedSeq$: 1,
  scg_IndexedSeqFactory: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
$c_sci_IndexedSeq$.prototype.$classData = $d_sci_IndexedSeq$;
var $n_sci_IndexedSeq$ = (void 0);
function $m_sci_IndexedSeq$() {
  if ((!$n_sci_IndexedSeq$)) {
    $n_sci_IndexedSeq$ = new $c_sci_IndexedSeq$().init___()
  };
  return $n_sci_IndexedSeq$
}
/** @constructor */
function $c_sci_ListSet$() {
  $c_scg_ImmutableSetFactory.call(this)
}
$c_sci_ListSet$.prototype = new $h_scg_ImmutableSetFactory();
$c_sci_ListSet$.prototype.constructor = $c_sci_ListSet$;
/** @constructor */
function $h_sci_ListSet$() {
  /*<skip>*/
}
$h_sci_ListSet$.prototype = $c_sci_ListSet$.prototype;
$c_sci_ListSet$.prototype.init___ = (function() {
  return this
});
$c_sci_ListSet$.prototype.emptyInstance__sci_Set = (function() {
  return $m_sci_ListSet$EmptyListSet$()
});
var $d_sci_ListSet$ = new $TypeData().initClass({
  sci_ListSet$: 0
}, false, "scala.collection.immutable.ListSet$", {
  sci_ListSet$: 1,
  scg_ImmutableSetFactory: 1,
  scg_SetFactory: 1,
  scg_GenSetFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListSet$.prototype.$classData = $d_sci_ListSet$;
var $n_sci_ListSet$ = (void 0);
function $m_sci_ListSet$() {
  if ((!$n_sci_ListSet$)) {
    $n_sci_ListSet$ = new $c_sci_ListSet$().init___()
  };
  return $n_sci_ListSet$
}
/** @constructor */
function $c_sjs_js_JavaScriptException() {
  $c_jl_RuntimeException.call(this);
  this.exception$4 = null
}
$c_sjs_js_JavaScriptException.prototype = new $h_jl_RuntimeException();
$c_sjs_js_JavaScriptException.prototype.constructor = $c_sjs_js_JavaScriptException;
/** @constructor */
function $h_sjs_js_JavaScriptException() {
  /*<skip>*/
}
$h_sjs_js_JavaScriptException.prototype = $c_sjs_js_JavaScriptException.prototype;
$c_sjs_js_JavaScriptException.prototype.productPrefix__T = (function() {
  return "JavaScriptException"
});
$c_sjs_js_JavaScriptException.prototype.productArity__I = (function() {
  return 1
});
$c_sjs_js_JavaScriptException.prototype.fillInStackTrace__jl_Throwable = (function() {
  var e = this.exception$4;
  this.stackdata = e;
  return this
});
$c_sjs_js_JavaScriptException.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if ($is_sjs_js_JavaScriptException(x$1)) {
    var JavaScriptException$1 = $as_sjs_js_JavaScriptException(x$1);
    return $m_sr_BoxesRunTime$().equals__O__O__Z(this.exception$4, JavaScriptException$1.exception$4)
  } else {
    return false
  }
});
$c_sjs_js_JavaScriptException.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.exception$4;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_sjs_js_JavaScriptException.prototype.getMessage__T = (function() {
  return $objectToString(this.exception$4)
});
$c_sjs_js_JavaScriptException.prototype.init___O = (function(exception) {
  this.exception$4 = exception;
  $c_jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
$c_sjs_js_JavaScriptException.prototype.hashCode__I = (function() {
  var this$2 = $m_s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
$c_sjs_js_JavaScriptException.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
function $is_sjs_js_JavaScriptException(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_JavaScriptException)))
}
function $as_sjs_js_JavaScriptException(obj) {
  return (($is_sjs_js_JavaScriptException(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.scalajs.js.JavaScriptException"))
}
function $isArrayOf_sjs_js_JavaScriptException(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_JavaScriptException)))
}
function $asArrayOf_sjs_js_JavaScriptException(obj, depth) {
  return (($isArrayOf_sjs_js_JavaScriptException(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.scalajs.js.JavaScriptException;", depth))
}
var $d_sjs_js_JavaScriptException = new $TypeData().initClass({
  sjs_js_JavaScriptException: 0
}, false, "scala.scalajs.js.JavaScriptException", {
  sjs_js_JavaScriptException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1
});
$c_sjs_js_JavaScriptException.prototype.$classData = $d_sjs_js_JavaScriptException;
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_PackageBase$() {
  $c_Ljapgolly_scalajs_react_vdom_PackageBase.call(this)
}
$c_Ljapgolly_scalajs_react_vdom_PackageBase$.prototype = new $h_Ljapgolly_scalajs_react_vdom_PackageBase();
$c_Ljapgolly_scalajs_react_vdom_PackageBase$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_PackageBase$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_PackageBase$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_PackageBase$.prototype = $c_Ljapgolly_scalajs_react_vdom_PackageBase$.prototype;
$c_Ljapgolly_scalajs_react_vdom_PackageBase$.prototype.init___ = (function() {
  $c_Ljapgolly_scalajs_react_vdom_Exports.prototype.init___.call(this);
  $f_Ljapgolly_scalajs_react_vdom_ImplicitsForVdomAttr1__$$init$__V(this);
  $f_Ljapgolly_scalajs_react_vdom_ImplicitsForVdomAttr__$$init$__V(this);
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_PackageBase$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_PackageBase$: 0
}, false, "japgolly.scalajs.react.vdom.PackageBase$", {
  Ljapgolly_scalajs_react_vdom_PackageBase$: 1,
  Ljapgolly_scalajs_react_vdom_PackageBase: 1,
  Ljapgolly_scalajs_react_vdom_Exports: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_Implicits: 1,
  Ljapgolly_scalajs_react_vdom_ImplicitsForTagMod: 1,
  Ljapgolly_scalajs_react_vdom_ImplicitsForVdomAttr: 1,
  Ljapgolly_scalajs_react_vdom_ImplicitsForVdomAttr1: 1,
  Ljapgolly_scalajs_react_vdom_ImplicitsForVdomNode: 1,
  Ljapgolly_scalajs_react_vdom_ImplicitsForVdomElement: 1
});
$c_Ljapgolly_scalajs_react_vdom_PackageBase$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_PackageBase$;
var $n_Ljapgolly_scalajs_react_vdom_PackageBase$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_PackageBase$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_PackageBase$)) {
    $n_Ljapgolly_scalajs_react_vdom_PackageBase$ = new $c_Ljapgolly_scalajs_react_vdom_PackageBase$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_PackageBase$
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_html$und$less$up$() {
  $c_Ljapgolly_scalajs_react_vdom_PackageBase.call(this);
  this.$$less$3 = null;
  this.$$up$3 = null
}
$c_Ljapgolly_scalajs_react_vdom_html$und$less$up$.prototype = new $h_Ljapgolly_scalajs_react_vdom_PackageBase();
$c_Ljapgolly_scalajs_react_vdom_html$und$less$up$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_html$und$less$up$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_html$und$less$up$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_html$und$less$up$.prototype = $c_Ljapgolly_scalajs_react_vdom_html$und$less$up$.prototype;
$c_Ljapgolly_scalajs_react_vdom_html$und$less$up$.prototype.init___ = (function() {
  $c_Ljapgolly_scalajs_react_vdom_Exports.prototype.init___.call(this);
  $f_Ljapgolly_scalajs_react_vdom_ImplicitsForVdomAttr1__$$init$__V(this);
  $f_Ljapgolly_scalajs_react_vdom_ImplicitsForVdomAttr__$$init$__V(this);
  $n_Ljapgolly_scalajs_react_vdom_html$und$less$up$ = this;
  this.$$less$3 = $m_Ljapgolly_scalajs_react_vdom_HtmlTags$();
  this.$$up$3 = $m_Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles$();
  return this
});
var $d_Ljapgolly_scalajs_react_vdom_html$und$less$up$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_html$und$less$up$: 0
}, false, "japgolly.scalajs.react.vdom.html_$less$up$", {
  Ljapgolly_scalajs_react_vdom_html$und$less$up$: 1,
  Ljapgolly_scalajs_react_vdom_PackageBase: 1,
  Ljapgolly_scalajs_react_vdom_Exports: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_Implicits: 1,
  Ljapgolly_scalajs_react_vdom_ImplicitsForTagMod: 1,
  Ljapgolly_scalajs_react_vdom_ImplicitsForVdomAttr: 1,
  Ljapgolly_scalajs_react_vdom_ImplicitsForVdomAttr1: 1,
  Ljapgolly_scalajs_react_vdom_ImplicitsForVdomNode: 1,
  Ljapgolly_scalajs_react_vdom_ImplicitsForVdomElement: 1
});
$c_Ljapgolly_scalajs_react_vdom_html$und$less$up$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_html$und$less$up$;
var $n_Ljapgolly_scalajs_react_vdom_html$und$less$up$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_html$und$less$up$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_html$und$less$up$)) {
    $n_Ljapgolly_scalajs_react_vdom_html$und$less$up$ = new $c_Ljapgolly_scalajs_react_vdom_html$und$less$up$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_html$und$less$up$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$BooleanManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$BooleanManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$BooleanManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$BooleanManifest$.prototype = $c_s_reflect_ManifestFactory$BooleanManifest$.prototype;
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype.init___ = (function() {
  this.toString$1 = "Boolean";
  return this
});
var $d_s_reflect_ManifestFactory$BooleanManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$BooleanManifest$: 0
}, false, "scala.reflect.ManifestFactory$BooleanManifest$", {
  s_reflect_ManifestFactory$BooleanManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$BooleanManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$BooleanManifest$;
var $n_s_reflect_ManifestFactory$BooleanManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$BooleanManifest$() {
  if ((!$n_s_reflect_ManifestFactory$BooleanManifest$)) {
    $n_s_reflect_ManifestFactory$BooleanManifest$ = new $c_s_reflect_ManifestFactory$BooleanManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$BooleanManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$ByteManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$ByteManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$ByteManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$ByteManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$ByteManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$ByteManifest$.prototype = $c_s_reflect_ManifestFactory$ByteManifest$.prototype;
$c_s_reflect_ManifestFactory$ByteManifest$.prototype.init___ = (function() {
  this.toString$1 = "Byte";
  return this
});
var $d_s_reflect_ManifestFactory$ByteManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$ByteManifest$: 0
}, false, "scala.reflect.ManifestFactory$ByteManifest$", {
  s_reflect_ManifestFactory$ByteManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$ByteManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$ByteManifest$;
var $n_s_reflect_ManifestFactory$ByteManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$ByteManifest$() {
  if ((!$n_s_reflect_ManifestFactory$ByteManifest$)) {
    $n_s_reflect_ManifestFactory$ByteManifest$ = new $c_s_reflect_ManifestFactory$ByteManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$ByteManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$CharManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$CharManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$CharManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$CharManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$CharManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$CharManifest$.prototype = $c_s_reflect_ManifestFactory$CharManifest$.prototype;
$c_s_reflect_ManifestFactory$CharManifest$.prototype.init___ = (function() {
  this.toString$1 = "Char";
  return this
});
var $d_s_reflect_ManifestFactory$CharManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$CharManifest$: 0
}, false, "scala.reflect.ManifestFactory$CharManifest$", {
  s_reflect_ManifestFactory$CharManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$CharManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$CharManifest$;
var $n_s_reflect_ManifestFactory$CharManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$CharManifest$() {
  if ((!$n_s_reflect_ManifestFactory$CharManifest$)) {
    $n_s_reflect_ManifestFactory$CharManifest$ = new $c_s_reflect_ManifestFactory$CharManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$CharManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$DoubleManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$DoubleManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$DoubleManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$DoubleManifest$.prototype = $c_s_reflect_ManifestFactory$DoubleManifest$.prototype;
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype.init___ = (function() {
  this.toString$1 = "Double";
  return this
});
var $d_s_reflect_ManifestFactory$DoubleManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$DoubleManifest$: 0
}, false, "scala.reflect.ManifestFactory$DoubleManifest$", {
  s_reflect_ManifestFactory$DoubleManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$DoubleManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$DoubleManifest$;
var $n_s_reflect_ManifestFactory$DoubleManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$DoubleManifest$() {
  if ((!$n_s_reflect_ManifestFactory$DoubleManifest$)) {
    $n_s_reflect_ManifestFactory$DoubleManifest$ = new $c_s_reflect_ManifestFactory$DoubleManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$DoubleManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$FloatManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$FloatManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$FloatManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$FloatManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$FloatManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$FloatManifest$.prototype = $c_s_reflect_ManifestFactory$FloatManifest$.prototype;
$c_s_reflect_ManifestFactory$FloatManifest$.prototype.init___ = (function() {
  this.toString$1 = "Float";
  return this
});
var $d_s_reflect_ManifestFactory$FloatManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$FloatManifest$: 0
}, false, "scala.reflect.ManifestFactory$FloatManifest$", {
  s_reflect_ManifestFactory$FloatManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$FloatManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$FloatManifest$;
var $n_s_reflect_ManifestFactory$FloatManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$FloatManifest$() {
  if ((!$n_s_reflect_ManifestFactory$FloatManifest$)) {
    $n_s_reflect_ManifestFactory$FloatManifest$ = new $c_s_reflect_ManifestFactory$FloatManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$FloatManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$IntManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$IntManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$IntManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$IntManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$IntManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$IntManifest$.prototype = $c_s_reflect_ManifestFactory$IntManifest$.prototype;
$c_s_reflect_ManifestFactory$IntManifest$.prototype.init___ = (function() {
  this.toString$1 = "Int";
  return this
});
var $d_s_reflect_ManifestFactory$IntManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$IntManifest$: 0
}, false, "scala.reflect.ManifestFactory$IntManifest$", {
  s_reflect_ManifestFactory$IntManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$IntManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$IntManifest$;
var $n_s_reflect_ManifestFactory$IntManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$IntManifest$() {
  if ((!$n_s_reflect_ManifestFactory$IntManifest$)) {
    $n_s_reflect_ManifestFactory$IntManifest$ = new $c_s_reflect_ManifestFactory$IntManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$IntManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$LongManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$LongManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$LongManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$LongManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$LongManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$LongManifest$.prototype = $c_s_reflect_ManifestFactory$LongManifest$.prototype;
$c_s_reflect_ManifestFactory$LongManifest$.prototype.init___ = (function() {
  this.toString$1 = "Long";
  return this
});
var $d_s_reflect_ManifestFactory$LongManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$LongManifest$: 0
}, false, "scala.reflect.ManifestFactory$LongManifest$", {
  s_reflect_ManifestFactory$LongManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$LongManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$LongManifest$;
var $n_s_reflect_ManifestFactory$LongManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$LongManifest$() {
  if ((!$n_s_reflect_ManifestFactory$LongManifest$)) {
    $n_s_reflect_ManifestFactory$LongManifest$ = new $c_s_reflect_ManifestFactory$LongManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$LongManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$PhantomManifest() {
  $c_s_reflect_ManifestFactory$ClassTypeManifest.call(this);
  this.toString$2 = null
}
$c_s_reflect_ManifestFactory$PhantomManifest.prototype = new $h_s_reflect_ManifestFactory$ClassTypeManifest();
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.constructor = $c_s_reflect_ManifestFactory$PhantomManifest;
/** @constructor */
function $h_s_reflect_ManifestFactory$PhantomManifest() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$PhantomManifest.prototype = $c_s_reflect_ManifestFactory$PhantomManifest.prototype;
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.equals__O__Z = (function(that) {
  return (this === that)
});
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.toString__T = (function() {
  return this.toString$2
});
$c_s_reflect_ManifestFactory$PhantomManifest.prototype.hashCode__I = (function() {
  return $systemIdentityHashCode(this)
});
/** @constructor */
function $c_s_reflect_ManifestFactory$ShortManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$ShortManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$ShortManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$ShortManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$ShortManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$ShortManifest$.prototype = $c_s_reflect_ManifestFactory$ShortManifest$.prototype;
$c_s_reflect_ManifestFactory$ShortManifest$.prototype.init___ = (function() {
  this.toString$1 = "Short";
  return this
});
var $d_s_reflect_ManifestFactory$ShortManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$ShortManifest$: 0
}, false, "scala.reflect.ManifestFactory$ShortManifest$", {
  s_reflect_ManifestFactory$ShortManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$ShortManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$ShortManifest$;
var $n_s_reflect_ManifestFactory$ShortManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$ShortManifest$() {
  if ((!$n_s_reflect_ManifestFactory$ShortManifest$)) {
    $n_s_reflect_ManifestFactory$ShortManifest$ = new $c_s_reflect_ManifestFactory$ShortManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$ShortManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$UnitManifest$() {
  $c_s_reflect_AnyValManifest.call(this)
}
$c_s_reflect_ManifestFactory$UnitManifest$.prototype = new $h_s_reflect_AnyValManifest();
$c_s_reflect_ManifestFactory$UnitManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$UnitManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$UnitManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$UnitManifest$.prototype = $c_s_reflect_ManifestFactory$UnitManifest$.prototype;
$c_s_reflect_ManifestFactory$UnitManifest$.prototype.init___ = (function() {
  this.toString$1 = "Unit";
  return this
});
var $d_s_reflect_ManifestFactory$UnitManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$UnitManifest$: 0
}, false, "scala.reflect.ManifestFactory$UnitManifest$", {
  s_reflect_ManifestFactory$UnitManifest$: 1,
  s_reflect_AnyValManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$UnitManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$UnitManifest$;
var $n_s_reflect_ManifestFactory$UnitManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$UnitManifest$() {
  if ((!$n_s_reflect_ManifestFactory$UnitManifest$)) {
    $n_s_reflect_ManifestFactory$UnitManifest$ = new $c_s_reflect_ManifestFactory$UnitManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$UnitManifest$
}
function $f_sc_IterableLike__sameElements__sc_GenIterable__Z($thiz, that) {
  var these = $thiz.iterator__sc_Iterator();
  var those = that.iterator__sc_Iterator();
  while ((these.hasNext__Z() && those.hasNext__Z())) {
    if ((!$m_sr_BoxesRunTime$().equals__O__O__Z(these.next__O(), those.next__O()))) {
      return false
    }
  };
  return ((!these.hasNext__Z()) && (!those.hasNext__Z()))
}
function $f_sc_IterableLike__take__I__O($thiz, n) {
  var b = $thiz.newBuilder__scm_Builder();
  if ((n <= 0)) {
    return b.result__O()
  } else {
    b.sizeHintBounded__I__sc_TraversableLike__V(n, $thiz);
    var i = 0;
    var it = $thiz.iterator__sc_Iterator();
    while (((i < n) && it.hasNext__Z())) {
      b.$$plus$eq__O__scm_Builder(it.next__O());
      i = ((1 + i) | 0)
    };
    return b.result__O()
  }
}
function $f_sc_IterableLike__copyToArray__O__I__I__V($thiz, xs, start, len) {
  var i = start;
  var x = ((start + len) | 0);
  var that = $m_sr_ScalaRunTime$().array$undlength__O__I(xs);
  var end = ((x < that) ? x : that);
  var it = $thiz.iterator__sc_Iterator();
  while (((i < end) && it.hasNext__Z())) {
    $m_sr_ScalaRunTime$().array$undupdate__O__I__O__V(xs, i, it.next__O());
    i = ((1 + i) | 0)
  }
}
/** @constructor */
function $c_sci_List$() {
  $c_scg_SeqFactory.call(this);
  this.partialNotApplied$5 = null
}
$c_sci_List$.prototype = new $h_scg_SeqFactory();
$c_sci_List$.prototype.constructor = $c_sci_List$;
/** @constructor */
function $h_sci_List$() {
  /*<skip>*/
}
$h_sci_List$.prototype = $c_sci_List$.prototype;
$c_sci_List$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  $n_sci_List$ = this;
  this.partialNotApplied$5 = new $c_sci_List$$anon$1().init___();
  return this
});
$c_sci_List$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ListBuffer().init___()
});
var $d_sci_List$ = new $TypeData().initClass({
  sci_List$: 0
}, false, "scala.collection.immutable.List$", {
  sci_List$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_List$.prototype.$classData = $d_sci_List$;
var $n_sci_List$ = (void 0);
function $m_sci_List$() {
  if ((!$n_sci_List$)) {
    $n_sci_List$ = new $c_sci_List$().init___()
  };
  return $n_sci_List$
}
/** @constructor */
function $c_sci_Stream$() {
  $c_scg_SeqFactory.call(this)
}
$c_sci_Stream$.prototype = new $h_scg_SeqFactory();
$c_sci_Stream$.prototype.constructor = $c_sci_Stream$;
/** @constructor */
function $h_sci_Stream$() {
  /*<skip>*/
}
$h_sci_Stream$.prototype = $c_sci_Stream$.prototype;
$c_sci_Stream$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_sci_Stream$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_sci_Stream$StreamBuilder().init___()
});
var $d_sci_Stream$ = new $TypeData().initClass({
  sci_Stream$: 0
}, false, "scala.collection.immutable.Stream$", {
  sci_Stream$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Stream$.prototype.$classData = $d_sci_Stream$;
var $n_sci_Stream$ = (void 0);
function $m_sci_Stream$() {
  if ((!$n_sci_Stream$)) {
    $n_sci_Stream$ = new $c_sci_Stream$().init___()
  };
  return $n_sci_Stream$
}
/** @constructor */
function $c_scm_ArrayBuffer$() {
  $c_scg_SeqFactory.call(this)
}
$c_scm_ArrayBuffer$.prototype = new $h_scg_SeqFactory();
$c_scm_ArrayBuffer$.prototype.constructor = $c_scm_ArrayBuffer$;
/** @constructor */
function $h_scm_ArrayBuffer$() {
  /*<skip>*/
}
$h_scm_ArrayBuffer$.prototype = $c_scm_ArrayBuffer$.prototype;
$c_scm_ArrayBuffer$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_scm_ArrayBuffer$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_ArrayBuffer().init___()
});
var $d_scm_ArrayBuffer$ = new $TypeData().initClass({
  scm_ArrayBuffer$: 0
}, false, "scala.collection.mutable.ArrayBuffer$", {
  scm_ArrayBuffer$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ArrayBuffer$.prototype.$classData = $d_scm_ArrayBuffer$;
var $n_scm_ArrayBuffer$ = (void 0);
function $m_scm_ArrayBuffer$() {
  if ((!$n_scm_ArrayBuffer$)) {
    $n_scm_ArrayBuffer$ = new $c_scm_ArrayBuffer$().init___()
  };
  return $n_scm_ArrayBuffer$
}
/** @constructor */
function $c_scm_ListBuffer$() {
  $c_scg_SeqFactory.call(this)
}
$c_scm_ListBuffer$.prototype = new $h_scg_SeqFactory();
$c_scm_ListBuffer$.prototype.constructor = $c_scm_ListBuffer$;
/** @constructor */
function $h_scm_ListBuffer$() {
  /*<skip>*/
}
$h_scm_ListBuffer$.prototype = $c_scm_ListBuffer$.prototype;
$c_scm_ListBuffer$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  return this
});
$c_scm_ListBuffer$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_GrowingBuilder().init___scg_Growable(new $c_scm_ListBuffer().init___())
});
var $d_scm_ListBuffer$ = new $TypeData().initClass({
  scm_ListBuffer$: 0
}, false, "scala.collection.mutable.ListBuffer$", {
  scm_ListBuffer$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ListBuffer$.prototype.$classData = $d_scm_ListBuffer$;
var $n_scm_ListBuffer$ = (void 0);
function $m_scm_ListBuffer$() {
  if ((!$n_scm_ListBuffer$)) {
    $n_scm_ListBuffer$ = new $c_scm_ListBuffer$().init___()
  };
  return $n_scm_ListBuffer$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$AnyManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$AnyManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$AnyManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$AnyManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$AnyManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$AnyManifest$.prototype = $c_s_reflect_ManifestFactory$AnyManifest$.prototype;
$c_s_reflect_ManifestFactory$AnyManifest$.prototype.init___ = (function() {
  this.toString$2 = "Any";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_O.getClassOf();
  this.typeArguments$1 = typeArguments;
  return this
});
var $d_s_reflect_ManifestFactory$AnyManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$AnyManifest$: 0
}, false, "scala.reflect.ManifestFactory$AnyManifest$", {
  s_reflect_ManifestFactory$AnyManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$AnyManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$AnyManifest$;
var $n_s_reflect_ManifestFactory$AnyManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$AnyManifest$() {
  if ((!$n_s_reflect_ManifestFactory$AnyManifest$)) {
    $n_s_reflect_ManifestFactory$AnyManifest$ = new $c_s_reflect_ManifestFactory$AnyManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$AnyManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$AnyValManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$AnyValManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$AnyValManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$AnyValManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$AnyValManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$AnyValManifest$.prototype = $c_s_reflect_ManifestFactory$AnyValManifest$.prototype;
$c_s_reflect_ManifestFactory$AnyValManifest$.prototype.init___ = (function() {
  this.toString$2 = "AnyVal";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_O.getClassOf();
  this.typeArguments$1 = typeArguments;
  return this
});
var $d_s_reflect_ManifestFactory$AnyValManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$AnyValManifest$: 0
}, false, "scala.reflect.ManifestFactory$AnyValManifest$", {
  s_reflect_ManifestFactory$AnyValManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$AnyValManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$AnyValManifest$;
var $n_s_reflect_ManifestFactory$AnyValManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$AnyValManifest$() {
  if ((!$n_s_reflect_ManifestFactory$AnyValManifest$)) {
    $n_s_reflect_ManifestFactory$AnyValManifest$ = new $c_s_reflect_ManifestFactory$AnyValManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$AnyValManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$NothingManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$NothingManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$NothingManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$NothingManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$NothingManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$NothingManifest$.prototype = $c_s_reflect_ManifestFactory$NothingManifest$.prototype;
$c_s_reflect_ManifestFactory$NothingManifest$.prototype.init___ = (function() {
  this.toString$2 = "Nothing";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_sr_Nothing$.getClassOf();
  this.typeArguments$1 = typeArguments;
  return this
});
var $d_s_reflect_ManifestFactory$NothingManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$NothingManifest$: 0
}, false, "scala.reflect.ManifestFactory$NothingManifest$", {
  s_reflect_ManifestFactory$NothingManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$NothingManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$NothingManifest$;
var $n_s_reflect_ManifestFactory$NothingManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$NothingManifest$() {
  if ((!$n_s_reflect_ManifestFactory$NothingManifest$)) {
    $n_s_reflect_ManifestFactory$NothingManifest$ = new $c_s_reflect_ManifestFactory$NothingManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$NothingManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$NullManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$NullManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$NullManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$NullManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$NullManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$NullManifest$.prototype = $c_s_reflect_ManifestFactory$NullManifest$.prototype;
$c_s_reflect_ManifestFactory$NullManifest$.prototype.init___ = (function() {
  this.toString$2 = "Null";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_sr_Null$.getClassOf();
  this.typeArguments$1 = typeArguments;
  return this
});
var $d_s_reflect_ManifestFactory$NullManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$NullManifest$: 0
}, false, "scala.reflect.ManifestFactory$NullManifest$", {
  s_reflect_ManifestFactory$NullManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$NullManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$NullManifest$;
var $n_s_reflect_ManifestFactory$NullManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$NullManifest$() {
  if ((!$n_s_reflect_ManifestFactory$NullManifest$)) {
    $n_s_reflect_ManifestFactory$NullManifest$ = new $c_s_reflect_ManifestFactory$NullManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$NullManifest$
}
/** @constructor */
function $c_s_reflect_ManifestFactory$ObjectManifest$() {
  $c_s_reflect_ManifestFactory$PhantomManifest.call(this)
}
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype = new $h_s_reflect_ManifestFactory$PhantomManifest();
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype.constructor = $c_s_reflect_ManifestFactory$ObjectManifest$;
/** @constructor */
function $h_s_reflect_ManifestFactory$ObjectManifest$() {
  /*<skip>*/
}
$h_s_reflect_ManifestFactory$ObjectManifest$.prototype = $c_s_reflect_ManifestFactory$ObjectManifest$.prototype;
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype.init___ = (function() {
  this.toString$2 = "Object";
  var prefix = $m_s_None$();
  var typeArguments = $m_sci_Nil$();
  this.prefix$1 = prefix;
  this.runtimeClass1$1 = $d_O.getClassOf();
  this.typeArguments$1 = typeArguments;
  return this
});
var $d_s_reflect_ManifestFactory$ObjectManifest$ = new $TypeData().initClass({
  s_reflect_ManifestFactory$ObjectManifest$: 0
}, false, "scala.reflect.ManifestFactory$ObjectManifest$", {
  s_reflect_ManifestFactory$ObjectManifest$: 1,
  s_reflect_ManifestFactory$PhantomManifest: 1,
  s_reflect_ManifestFactory$ClassTypeManifest: 1,
  O: 1,
  s_reflect_Manifest: 1,
  s_reflect_ClassTag: 1,
  s_reflect_ClassManifestDeprecatedApis: 1,
  s_reflect_OptManifest: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  s_Equals: 1
});
$c_s_reflect_ManifestFactory$ObjectManifest$.prototype.$classData = $d_s_reflect_ManifestFactory$ObjectManifest$;
var $n_s_reflect_ManifestFactory$ObjectManifest$ = (void 0);
function $m_s_reflect_ManifestFactory$ObjectManifest$() {
  if ((!$n_s_reflect_ManifestFactory$ObjectManifest$)) {
    $n_s_reflect_ManifestFactory$ObjectManifest$ = new $c_s_reflect_ManifestFactory$ObjectManifest$().init___()
  };
  return $n_s_reflect_ManifestFactory$ObjectManifest$
}
function $is_sc_GenSeq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenSeq)))
}
function $as_sc_GenSeq(obj) {
  return (($is_sc_GenSeq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.GenSeq"))
}
function $isArrayOf_sc_GenSeq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenSeq)))
}
function $asArrayOf_sc_GenSeq(obj, depth) {
  return (($isArrayOf_sc_GenSeq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.GenSeq;", depth))
}
/** @constructor */
function $c_sci_Vector$() {
  $c_scg_IndexedSeqFactory.call(this);
  this.NIL$6 = null
}
$c_sci_Vector$.prototype = new $h_scg_IndexedSeqFactory();
$c_sci_Vector$.prototype.constructor = $c_sci_Vector$;
/** @constructor */
function $h_sci_Vector$() {
  /*<skip>*/
}
$h_sci_Vector$.prototype = $c_sci_Vector$.prototype;
$c_sci_Vector$.prototype.init___ = (function() {
  $c_scg_GenTraversableFactory.prototype.init___.call(this);
  $n_sci_Vector$ = this;
  this.NIL$6 = new $c_sci_Vector().init___I__I__I(0, 0, 0);
  return this
});
$c_sci_Vector$.prototype.newBuilder__scm_Builder = (function() {
  return new $c_sci_VectorBuilder().init___()
});
var $d_sci_Vector$ = new $TypeData().initClass({
  sci_Vector$: 0
}, false, "scala.collection.immutable.Vector$", {
  sci_Vector$: 1,
  scg_IndexedSeqFactory: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Vector$.prototype.$classData = $d_sci_Vector$;
var $n_sci_Vector$ = (void 0);
function $m_sci_Vector$() {
  if ((!$n_sci_Vector$)) {
    $n_sci_Vector$ = new $c_sci_Vector$().init___()
  };
  return $n_sci_Vector$
}
/** @constructor */
function $c_sc_AbstractTraversable() {
  $c_O.call(this)
}
$c_sc_AbstractTraversable.prototype = new $h_O();
$c_sc_AbstractTraversable.prototype.constructor = $c_sc_AbstractTraversable;
/** @constructor */
function $h_sc_AbstractTraversable() {
  /*<skip>*/
}
$h_sc_AbstractTraversable.prototype = $c_sc_AbstractTraversable.prototype;
$c_sc_AbstractTraversable.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this, start, sep, end)
});
$c_sc_AbstractTraversable.prototype.sizeHintIfCheap__I = (function() {
  return (-1)
});
$c_sc_AbstractTraversable.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_sc_AbstractTraversable.prototype.repr__O = (function() {
  return this
});
$c_sc_AbstractTraversable.prototype.stringPrefix__T = (function() {
  return $f_sc_TraversableLike__stringPrefix__T(this)
});
$c_sc_AbstractTraversable.prototype.newBuilder__scm_Builder = (function() {
  return this.companion__scg_GenericCompanion().newBuilder__scm_Builder()
});
function $f_sc_SeqLike__isEmpty__Z($thiz) {
  return ($thiz.lengthCompare__I__I(0) === 0)
}
function $f_sc_SeqLike__$$colon$plus__O__scg_CanBuildFrom__O($thiz, elem, bf) {
  var b = bf.apply__O__scm_Builder($thiz.repr__O());
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($thiz.thisCollection__sc_Seq());
  b.$$plus$eq__O__scm_Builder(elem);
  return b.result__O()
}
function $is_sc_GenSet(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenSet)))
}
function $as_sc_GenSet(obj) {
  return (($is_sc_GenSet(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.GenSet"))
}
function $isArrayOf_sc_GenSet(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenSet)))
}
function $asArrayOf_sc_GenSet(obj, depth) {
  return (($isArrayOf_sc_GenSet(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.GenSet;", depth))
}
function $is_sc_IndexedSeqLike(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IndexedSeqLike)))
}
function $as_sc_IndexedSeqLike(obj) {
  return (($is_sc_IndexedSeqLike(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.IndexedSeqLike"))
}
function $isArrayOf_sc_IndexedSeqLike(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IndexedSeqLike)))
}
function $asArrayOf_sc_IndexedSeqLike(obj, depth) {
  return (($isArrayOf_sc_IndexedSeqLike(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.IndexedSeqLike;", depth))
}
function $is_sc_LinearSeqLike(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeqLike)))
}
function $as_sc_LinearSeqLike(obj) {
  return (($is_sc_LinearSeqLike(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.LinearSeqLike"))
}
function $isArrayOf_sc_LinearSeqLike(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeqLike)))
}
function $asArrayOf_sc_LinearSeqLike(obj, depth) {
  return (($isArrayOf_sc_LinearSeqLike(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.LinearSeqLike;", depth))
}
/** @constructor */
function $c_Ljapgolly_scalajs_react_vdom_all$() {
  $c_Ljapgolly_scalajs_react_vdom_PackageBase.call(this);
  this.backgroundAttachment$module$3 = null;
  this.backgroundOrigin$module$3 = null;
  this.backgroundClip$module$3 = null;
  this.backgroundSize$module$3 = null;
  this.borderCollapse$module$3 = null;
  this.borderSpacing$module$3 = null;
  this.boxSizing$module$3 = null;
  this.color$module$3 = null;
  this.clip$module$3 = null;
  this.cursor$module$3 = null;
  this.float$module$3 = null;
  this.direction$module$3 = null;
  this.display$module$3 = null;
  this.pointerEvents$module$3 = null;
  this.listStyleImage$module$3 = null;
  this.listStylePosition$module$3 = null;
  this.wordWrap$module$3 = null;
  this.verticalAlign$module$3 = null;
  this.mask$module$3 = null;
  this.emptyCells$module$3 = null;
  this.listStyleType$module$3 = null;
  this.captionSide$module$3 = null;
  this.position$module$3 = null;
  this.quotes$module$3 = null;
  this.tableLayout$module$3 = null;
  this.fontSize$module$3 = null;
  this.fontWeight$module$3 = null;
  this.fontStyle$module$3 = null;
  this.clear$module$3 = null;
  this.outlineWidth$module$3 = null;
  this.outlineColor$module$3 = null;
  this.textDecoration$module$3 = null;
  this.textOverflow$module$3 = null;
  this.textUnderlinePosition$module$3 = null;
  this.textTransform$module$3 = null;
  this.visibility$module$3 = null;
  this.whiteSpace$module$3 = null;
  this.backfaceVisibility$module$3 = null;
  this.columns$module$3 = null;
  this.columnFill$module$3 = null;
  this.columnSpan$module$3 = null;
  this.columnRuleWidth$module$3 = null;
  this.columnRuleStyle$module$3 = null;
  this.alignContent$module$3 = null;
  this.alignSelf$module$3 = null;
  this.flexWrap$module$3 = null;
  this.alignItems$module$3 = null;
  this.justifyContent$module$3 = null;
  this.flexDirection$module$3 = null;
  this.transformStyle$module$3 = null;
  this.unicodeBidi$module$3 = null;
  this.wordBreak$module$3 = null;
  this.aria$module$3 = null;
  this.autoComplete$module$3 = null;
  this.key$3 = null;
  this.onChange$3 = null;
  this.onClick$3 = null;
  this.onClickCapture$3 = null;
  this.src$3 = null;
  this.target$module$3 = null;
  this.title$3 = null;
  this.type$3 = null;
  this.value$3 = null;
  this.wrap$module$3 = null;
  this.input$module$3 = null
}
$c_Ljapgolly_scalajs_react_vdom_all$.prototype = new $h_Ljapgolly_scalajs_react_vdom_PackageBase();
$c_Ljapgolly_scalajs_react_vdom_all$.prototype.constructor = $c_Ljapgolly_scalajs_react_vdom_all$;
/** @constructor */
function $h_Ljapgolly_scalajs_react_vdom_all$() {
  /*<skip>*/
}
$h_Ljapgolly_scalajs_react_vdom_all$.prototype = $c_Ljapgolly_scalajs_react_vdom_all$.prototype;
$c_Ljapgolly_scalajs_react_vdom_all$.prototype.init___ = (function() {
  $c_Ljapgolly_scalajs_react_vdom_Exports.prototype.init___.call(this);
  $f_Ljapgolly_scalajs_react_vdom_ImplicitsForVdomAttr1__$$init$__V(this);
  $f_Ljapgolly_scalajs_react_vdom_ImplicitsForVdomAttr__$$init$__V(this);
  $n_Ljapgolly_scalajs_react_vdom_all$ = this;
  $f_Ljapgolly_scalajs_react_vdom_HtmlAttrs__$$init$__V(this);
  return this
});
$c_Ljapgolly_scalajs_react_vdom_all$.prototype.japgolly$scalajs$react$vdom$HtmlAttrs$$undsetter$und$onChange$und$eq__Ljapgolly_scalajs_react_vdom_Attr$Event__V = (function(x$1) {
  this.onChange$3 = x$1
});
$c_Ljapgolly_scalajs_react_vdom_all$.prototype.japgolly$scalajs$react$vdom$HtmlAttrs$$undsetter$und$title$und$eq__Ljapgolly_scalajs_react_vdom_Attr__V = (function(x$1) {
  this.title$3 = x$1
});
$c_Ljapgolly_scalajs_react_vdom_all$.prototype.japgolly$scalajs$react$vdom$HtmlAttrs$$undsetter$und$key$und$eq__Ljapgolly_scalajs_react_vdom_Attr__V = (function(x$1) {
  this.key$3 = x$1
});
$c_Ljapgolly_scalajs_react_vdom_all$.prototype.japgolly$scalajs$react$vdom$HtmlAttrs$$undsetter$und$onClickCapture$und$eq__Ljapgolly_scalajs_react_vdom_Attr$Event__V = (function(x$1) {
  this.onClickCapture$3 = x$1
});
$c_Ljapgolly_scalajs_react_vdom_all$.prototype.japgolly$scalajs$react$vdom$HtmlAttrs$$undsetter$und$onClick$und$eq__Ljapgolly_scalajs_react_vdom_Attr$Event__V = (function(x$1) {
  this.onClick$3 = x$1
});
$c_Ljapgolly_scalajs_react_vdom_all$.prototype.japgolly$scalajs$react$vdom$HtmlAttrs$$undsetter$und$value$und$eq__Ljapgolly_scalajs_react_vdom_Attr__V = (function(x$1) {
  this.value$3 = x$1
});
$c_Ljapgolly_scalajs_react_vdom_all$.prototype.japgolly$scalajs$react$vdom$HtmlAttrs$$undsetter$und$type$und$eq__Ljapgolly_scalajs_react_vdom_Attr__V = (function(x$1) {
  this.type$3 = x$1
});
$c_Ljapgolly_scalajs_react_vdom_all$.prototype.japgolly$scalajs$react$vdom$HtmlAttrs$$undsetter$und$src$und$eq__Ljapgolly_scalajs_react_vdom_Attr__V = (function(x$1) {
  this.src$3 = x$1
});
var $d_Ljapgolly_scalajs_react_vdom_all$ = new $TypeData().initClass({
  Ljapgolly_scalajs_react_vdom_all$: 0
}, false, "japgolly.scalajs.react.vdom.all$", {
  Ljapgolly_scalajs_react_vdom_all$: 1,
  Ljapgolly_scalajs_react_vdom_PackageBase: 1,
  Ljapgolly_scalajs_react_vdom_Exports: 1,
  O: 1,
  Ljapgolly_scalajs_react_vdom_Implicits: 1,
  Ljapgolly_scalajs_react_vdom_ImplicitsForTagMod: 1,
  Ljapgolly_scalajs_react_vdom_ImplicitsForVdomAttr: 1,
  Ljapgolly_scalajs_react_vdom_ImplicitsForVdomAttr1: 1,
  Ljapgolly_scalajs_react_vdom_ImplicitsForVdomNode: 1,
  Ljapgolly_scalajs_react_vdom_ImplicitsForVdomElement: 1,
  Ljapgolly_scalajs_react_vdom_HtmlTags: 1,
  Ljapgolly_scalajs_react_vdom_HtmlAttrAndStyles: 1,
  Ljapgolly_scalajs_react_vdom_HtmlAttrs: 1,
  Ljapgolly_scalajs_react_vdom_HtmlStyles: 1
});
$c_Ljapgolly_scalajs_react_vdom_all$.prototype.$classData = $d_Ljapgolly_scalajs_react_vdom_all$;
var $n_Ljapgolly_scalajs_react_vdom_all$ = (void 0);
function $m_Ljapgolly_scalajs_react_vdom_all$() {
  if ((!$n_Ljapgolly_scalajs_react_vdom_all$)) {
    $n_Ljapgolly_scalajs_react_vdom_all$ = new $c_Ljapgolly_scalajs_react_vdom_all$().init___()
  };
  return $n_Ljapgolly_scalajs_react_vdom_all$
}
function $f_sc_IndexedSeqOptimized__lengthCompare__I__I($thiz, len) {
  return (($thiz.length__I() - len) | 0)
}
function $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z($thiz, that) {
  if ($is_sc_IndexedSeq(that)) {
    var x2 = $as_sc_IndexedSeq(that);
    var len = $thiz.length__I();
    if ((len === x2.length__I())) {
      var i = 0;
      while (((i < len) && $m_sr_BoxesRunTime$().equals__O__O__Z($thiz.apply__I__O(i), x2.apply__I__O(i)))) {
        i = ((1 + i) | 0)
      };
      return (i === len)
    } else {
      return false
    }
  } else {
    return $f_sc_IterableLike__sameElements__sc_GenIterable__Z($thiz, that)
  }
}
function $f_sc_IndexedSeqOptimized__isEmpty__Z($thiz) {
  return ($thiz.length__I() === 0)
}
function $f_sc_IndexedSeqOptimized__foreach__F1__V($thiz, f) {
  var i = 0;
  var len = $thiz.length__I();
  while ((i < len)) {
    f.apply__O__O($thiz.apply__I__O(i));
    i = ((1 + i) | 0)
  }
}
function $f_sc_IndexedSeqOptimized__copyToArray__O__I__I__V($thiz, xs, start, len) {
  var i = 0;
  var j = start;
  var x = $thiz.length__I();
  var x$1 = ((x < len) ? x : len);
  var that = (($m_sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0);
  var end = ((x$1 < that) ? x$1 : that);
  while ((i < end)) {
    $m_sr_ScalaRunTime$().array$undupdate__O__I__O__V(xs, j, $thiz.apply__I__O(i));
    i = ((1 + i) | 0);
    j = ((1 + j) | 0)
  }
}
function $f_sc_LinearSeqOptimized__lengthCompare__I__I($thiz, len) {
  if ((len < 0)) {
    return 1
  } else {
    var i = 0;
    var xs = $thiz;
    return $f_sc_LinearSeqOptimized__loop$1__psc_LinearSeqOptimized__I__sc_LinearSeqOptimized__I__I($thiz, i, xs, len)
  }
}
function $f_sc_LinearSeqOptimized__sameElements__sc_GenIterable__Z($thiz, that) {
  if ($is_sc_LinearSeq(that)) {
    var x2 = $as_sc_LinearSeq(that);
    if (($thiz === x2)) {
      return true
    } else {
      var these = $thiz;
      var those = x2;
      while ((((!these.isEmpty__Z()) && (!those.isEmpty__Z())) && $m_sr_BoxesRunTime$().equals__O__O__Z(these.head__O(), those.head__O()))) {
        these = $as_sc_LinearSeqOptimized(these.tail__O());
        those = $as_sc_LinearSeq(those.tail__O())
      };
      return (these.isEmpty__Z() && those.isEmpty__Z())
    }
  } else {
    return $f_sc_IterableLike__sameElements__sc_GenIterable__Z($thiz, that)
  }
}
function $f_sc_LinearSeqOptimized__apply__I__O($thiz, n) {
  var rest = $thiz.drop__I__sc_LinearSeqOptimized(n);
  if (((n < 0) || rest.isEmpty__Z())) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
  };
  return rest.head__O()
}
function $f_sc_LinearSeqOptimized__length__I($thiz) {
  var these = $thiz;
  var len = 0;
  while ((!these.isEmpty__Z())) {
    len = ((1 + len) | 0);
    these = $as_sc_LinearSeqOptimized(these.tail__O())
  };
  return len
}
function $f_sc_LinearSeqOptimized__isDefinedAt__I__Z($thiz, x) {
  return ((x >= 0) && ($f_sc_LinearSeqOptimized__lengthCompare__I__I($thiz, x) > 0))
}
function $f_sc_LinearSeqOptimized__loop$1__psc_LinearSeqOptimized__I__sc_LinearSeqOptimized__I__I($thiz, i, xs, len$1) {
  _loop: while (true) {
    if ((i === len$1)) {
      return (xs.isEmpty__Z() ? 0 : 1)
    } else if (xs.isEmpty__Z()) {
      return (-1)
    } else {
      var temp$i = ((1 + i) | 0);
      var temp$xs = $as_sc_LinearSeqOptimized(xs.tail__O());
      i = temp$i;
      xs = temp$xs;
      continue _loop
    }
  }
}
function $is_sc_LinearSeqOptimized(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeqOptimized)))
}
function $as_sc_LinearSeqOptimized(obj) {
  return (($is_sc_LinearSeqOptimized(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.LinearSeqOptimized"))
}
function $isArrayOf_sc_LinearSeqOptimized(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeqOptimized)))
}
function $asArrayOf_sc_LinearSeqOptimized(obj, depth) {
  return (($isArrayOf_sc_LinearSeqOptimized(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.LinearSeqOptimized;", depth))
}
function $f_sc_SetLike__isEmpty__Z($thiz) {
  return ($thiz.size__I() === 0)
}
/** @constructor */
function $c_sc_AbstractIterable() {
  $c_sc_AbstractTraversable.call(this)
}
$c_sc_AbstractIterable.prototype = new $h_sc_AbstractTraversable();
$c_sc_AbstractIterable.prototype.constructor = $c_sc_AbstractIterable;
/** @constructor */
function $h_sc_AbstractIterable() {
  /*<skip>*/
}
$h_sc_AbstractIterable.prototype = $c_sc_AbstractIterable.prototype;
$c_sc_AbstractIterable.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IterableLike__sameElements__sc_GenIterable__Z(this, that)
});
$c_sc_AbstractIterable.prototype.forall__F1__Z = (function(p) {
  var this$1 = this.iterator__sc_Iterator();
  return $f_sc_Iterator__forall__F1__Z(this$1, p)
});
$c_sc_AbstractIterable.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.iterator__sc_Iterator();
  $f_sc_Iterator__foreach__F1__V(this$1, f)
});
$c_sc_AbstractIterable.prototype.toStream__sci_Stream = (function() {
  return this.iterator__sc_Iterator().toStream__sci_Stream()
});
$c_sc_AbstractIterable.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_sc_IterableLike__copyToArray__O__I__I__V(this, xs, start, len)
});
function $is_sc_AbstractIterable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_AbstractIterable)))
}
function $as_sc_AbstractIterable(obj) {
  return (($is_sc_AbstractIterable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.AbstractIterable"))
}
function $isArrayOf_sc_AbstractIterable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_AbstractIterable)))
}
function $asArrayOf_sc_AbstractIterable(obj, depth) {
  return (($isArrayOf_sc_AbstractIterable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.AbstractIterable;", depth))
}
function $is_sci_Iterable(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Iterable)))
}
function $as_sci_Iterable(obj) {
  return (($is_sci_Iterable(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Iterable"))
}
function $isArrayOf_sci_Iterable(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Iterable)))
}
function $asArrayOf_sci_Iterable(obj, depth) {
  return (($isArrayOf_sci_Iterable(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Iterable;", depth))
}
var $d_sci_Iterable = new $TypeData().initClass({
  sci_Iterable: 0
}, true, "scala.collection.immutable.Iterable", {
  sci_Iterable: 1,
  sci_Traversable: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  s_Immutable: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1
});
/** @constructor */
function $c_sci_StringOps() {
  $c_O.call(this);
  this.repr$1 = null
}
$c_sci_StringOps.prototype = new $h_O();
$c_sci_StringOps.prototype.constructor = $c_sci_StringOps;
/** @constructor */
function $h_sci_StringOps() {
  /*<skip>*/
}
$h_sci_StringOps.prototype = $c_sci_StringOps.prototype;
$c_sci_StringOps.prototype.seq__sc_TraversableOnce = (function() {
  var $$this = this.repr$1;
  return new $c_sci_WrappedString().init___T($$this)
});
$c_sci_StringOps.prototype.apply__I__O = (function(idx) {
  var $$this = this.repr$1;
  var c = (65535 & $uI($$this.charCodeAt(idx)));
  return new $c_jl_Character().init___C(c)
});
$c_sci_StringOps.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_sci_StringOps.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_sci_StringOps.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_sci_StringOps.prototype.thisCollection__sc_Traversable = (function() {
  var $$this = this.repr$1;
  return new $c_sci_WrappedString().init___T($$this)
});
$c_sci_StringOps.prototype.equals__O__Z = (function(x$1) {
  return $m_sci_StringOps$().equals$extension__T__O__Z(this.repr$1, x$1)
});
$c_sci_StringOps.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this, start, sep, end)
});
$c_sci_StringOps.prototype.toString__T = (function() {
  var $$this = this.repr$1;
  return $$this
});
$c_sci_StringOps.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_sci_StringOps.prototype.iterator__sc_Iterator = (function() {
  var $$this = this.repr$1;
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $uI($$this.length))
});
$c_sci_StringOps.prototype.length__I = (function() {
  var $$this = this.repr$1;
  return $uI($$this.length)
});
$c_sci_StringOps.prototype.sizeHintIfCheap__I = (function() {
  var $$this = this.repr$1;
  return $uI($$this.length)
});
$c_sci_StringOps.prototype.toStream__sci_Stream = (function() {
  var $$this = this.repr$1;
  var this$3 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $uI($$this.length));
  return $f_sc_Iterator__toStream__sci_Stream(this$3)
});
$c_sci_StringOps.prototype.thisCollection__sc_Seq = (function() {
  var $$this = this.repr$1;
  return new $c_sci_WrappedString().init___T($$this)
});
$c_sci_StringOps.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_sci_StringOps.prototype.repr__O = (function() {
  return this.repr$1
});
$c_sci_StringOps.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_sc_IndexedSeqOptimized__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_sci_StringOps.prototype.hashCode__I = (function() {
  var $$this = this.repr$1;
  return $m_sjsr_RuntimeString$().hashCode__T__I($$this)
});
$c_sci_StringOps.prototype.init___T = (function(repr) {
  this.repr$1 = repr;
  return this
});
$c_sci_StringOps.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_StringBuilder().init___()
});
$c_sci_StringOps.prototype.stringPrefix__T = (function() {
  return $f_sc_TraversableLike__stringPrefix__T(this)
});
function $is_sci_StringOps(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_StringOps)))
}
function $as_sci_StringOps(obj) {
  return (($is_sci_StringOps(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.StringOps"))
}
function $isArrayOf_sci_StringOps(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_StringOps)))
}
function $asArrayOf_sci_StringOps(obj, depth) {
  return (($isArrayOf_sci_StringOps(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.StringOps;", depth))
}
var $d_sci_StringOps = new $TypeData().initClass({
  sci_StringOps: 0
}, false, "scala.collection.immutable.StringOps", {
  sci_StringOps: 1,
  O: 1,
  sci_StringLike: 1,
  sc_IndexedSeqOptimized: 1,
  sc_IndexedSeqLike: 1,
  sc_SeqLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenIterableLike: 1,
  sc_GenSeqLike: 1,
  s_math_Ordered: 1,
  jl_Comparable: 1
});
$c_sci_StringOps.prototype.$classData = $d_sci_StringOps;
function $is_sc_Seq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_Seq)))
}
function $as_sc_Seq(obj) {
  return (($is_sc_Seq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.Seq"))
}
function $isArrayOf_sc_Seq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_Seq)))
}
function $asArrayOf_sc_Seq(obj, depth) {
  return (($isArrayOf_sc_Seq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.Seq;", depth))
}
var $d_sc_Seq = new $TypeData().initClass({
  sc_Seq: 0
}, true, "scala.collection.Seq", {
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_Iterable: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1
});
function $is_sc_Set(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_Set)))
}
function $as_sc_Set(obj) {
  return (($is_sc_Set(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.Set"))
}
function $isArrayOf_sc_Set(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_Set)))
}
function $asArrayOf_sc_Set(obj, depth) {
  return (($isArrayOf_sc_Set(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.Set;", depth))
}
/** @constructor */
function $c_sjs_js_ArrayOps() {
  $c_O.call(this);
  this.scala$scalajs$js$ArrayOps$$array$f = null
}
$c_sjs_js_ArrayOps.prototype = new $h_O();
$c_sjs_js_ArrayOps.prototype.constructor = $c_sjs_js_ArrayOps;
/** @constructor */
function $h_sjs_js_ArrayOps() {
  /*<skip>*/
}
$h_sjs_js_ArrayOps.prototype = $c_sjs_js_ArrayOps.prototype;
$c_sjs_js_ArrayOps.prototype.seq__sc_TraversableOnce = (function() {
  return this.seq__sc_IndexedSeq()
});
$c_sjs_js_ArrayOps.prototype.seq__sc_IndexedSeq = (function() {
  return new $c_sjs_js_WrappedArray().init___sjs_js_Array(this.scala$scalajs$js$ArrayOps$$array$f)
});
$c_sjs_js_ArrayOps.prototype.init___ = (function() {
  $c_sjs_js_ArrayOps.prototype.init___sjs_js_Array.call(this, []);
  return this
});
$c_sjs_js_ArrayOps.prototype.apply__I__O = (function(index) {
  return this.scala$scalajs$js$ArrayOps$$array$f[index]
});
$c_sjs_js_ArrayOps.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_sjs_js_ArrayOps.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_sjs_js_ArrayOps.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_sjs_js_ArrayOps.prototype.thisCollection__sc_Traversable = (function() {
  return this.thisCollection__scm_IndexedSeq()
});
$c_sjs_js_ArrayOps.prototype.equals__O__Z = (function(that) {
  return $f_sc_GenSeqLike__equals__O__Z(this, that)
});
$c_sjs_js_ArrayOps.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this, start, sep, end)
});
$c_sjs_js_ArrayOps.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  this.scala$scalajs$js$ArrayOps$$array$f.push(elem);
  return this
});
$c_sjs_js_ArrayOps.prototype.thisCollection__scm_IndexedSeq = (function() {
  var repr = this.scala$scalajs$js$ArrayOps$$array$f;
  return new $c_sjs_js_WrappedArray().init___sjs_js_Array(repr)
});
$c_sjs_js_ArrayOps.prototype.toString__T = (function() {
  return $f_sc_TraversableLike__toString__T(this)
});
$c_sjs_js_ArrayOps.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_sjs_js_ArrayOps.prototype.result__O = (function() {
  return this.scala$scalajs$js$ArrayOps$$array$f
});
$c_sjs_js_ArrayOps.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $uI(this.scala$scalajs$js$ArrayOps$$array$f.length))
});
$c_sjs_js_ArrayOps.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_sjs_js_ArrayOps.prototype.length__I = (function() {
  return $uI(this.scala$scalajs$js$ArrayOps$$array$f.length)
});
$c_sjs_js_ArrayOps.prototype.sizeHintIfCheap__I = (function() {
  return $uI(this.scala$scalajs$js$ArrayOps$$array$f.length)
});
$c_sjs_js_ArrayOps.prototype.toStream__sci_Stream = (function() {
  var this$1 = new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $uI(this.scala$scalajs$js$ArrayOps$$array$f.length));
  return $f_sc_Iterator__toStream__sci_Stream(this$1)
});
$c_sjs_js_ArrayOps.prototype.thisCollection__sc_Seq = (function() {
  return this.thisCollection__scm_IndexedSeq()
});
$c_sjs_js_ArrayOps.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
$c_sjs_js_ArrayOps.prototype.repr__O = (function() {
  return this.scala$scalajs$js$ArrayOps$$array$f
});
$c_sjs_js_ArrayOps.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  this.scala$scalajs$js$ArrayOps$$array$f.push(elem);
  return this
});
$c_sjs_js_ArrayOps.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_sc_IndexedSeqOptimized__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_sjs_js_ArrayOps.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_sjs_js_ArrayOps.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this.seq__sc_IndexedSeq())
});
$c_sjs_js_ArrayOps.prototype.init___sjs_js_Array = (function(array) {
  this.scala$scalajs$js$ArrayOps$$array$f = array;
  return this
});
$c_sjs_js_ArrayOps.prototype.newBuilder__scm_Builder = (function() {
  return new $c_sjs_js_ArrayOps().init___()
});
$c_sjs_js_ArrayOps.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
});
$c_sjs_js_ArrayOps.prototype.stringPrefix__T = (function() {
  return $f_sc_TraversableLike__stringPrefix__T(this)
});
var $d_sjs_js_ArrayOps = new $TypeData().initClass({
  sjs_js_ArrayOps: 0
}, false, "scala.scalajs.js.ArrayOps", {
  sjs_js_ArrayOps: 1,
  O: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  scm_IndexedSeqLike: 1,
  sc_IndexedSeqLike: 1,
  sc_SeqLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenIterableLike: 1,
  sc_GenSeqLike: 1,
  sc_IndexedSeqOptimized: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
$c_sjs_js_ArrayOps.prototype.$classData = $d_sjs_js_ArrayOps;
function $is_sc_IndexedSeq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IndexedSeq)))
}
function $as_sc_IndexedSeq(obj) {
  return (($is_sc_IndexedSeq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.IndexedSeq"))
}
function $isArrayOf_sc_IndexedSeq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IndexedSeq)))
}
function $asArrayOf_sc_IndexedSeq(obj, depth) {
  return (($isArrayOf_sc_IndexedSeq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.IndexedSeq;", depth))
}
function $is_sc_LinearSeq(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeq)))
}
function $as_sc_LinearSeq(obj) {
  return (($is_sc_LinearSeq(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.LinearSeq"))
}
function $isArrayOf_sc_LinearSeq(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeq)))
}
function $asArrayOf_sc_LinearSeq(obj, depth) {
  return (($isArrayOf_sc_LinearSeq(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.LinearSeq;", depth))
}
/** @constructor */
function $c_sc_AbstractSeq() {
  $c_sc_AbstractIterable.call(this)
}
$c_sc_AbstractSeq.prototype = new $h_sc_AbstractIterable();
$c_sc_AbstractSeq.prototype.constructor = $c_sc_AbstractSeq;
/** @constructor */
function $h_sc_AbstractSeq() {
  /*<skip>*/
}
$h_sc_AbstractSeq.prototype = $c_sc_AbstractSeq.prototype;
$c_sc_AbstractSeq.prototype.isEmpty__Z = (function() {
  return $f_sc_SeqLike__isEmpty__Z(this)
});
$c_sc_AbstractSeq.prototype.equals__O__Z = (function(that) {
  return $f_sc_GenSeqLike__equals__O__Z(this, that)
});
$c_sc_AbstractSeq.prototype.toString__T = (function() {
  return $f_sc_TraversableLike__toString__T(this)
});
$c_sc_AbstractSeq.prototype.thisCollection__sc_Seq = (function() {
  return this
});
$c_sc_AbstractSeq.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this.seq__sc_Seq())
});
$c_sc_AbstractSeq.prototype.applyOrElse__O__F1__O = (function(x, $default) {
  return $f_s_PartialFunction__applyOrElse__O__F1__O(this, x, $default)
});
$c_sc_AbstractSeq.prototype.andThen__F1__F1 = (function(g) {
  return new $c_s_PartialFunction$AndThen().init___s_PartialFunction__F1(this, g)
});
/** @constructor */
function $c_sc_AbstractSet() {
  $c_sc_AbstractIterable.call(this)
}
$c_sc_AbstractSet.prototype = new $h_sc_AbstractIterable();
$c_sc_AbstractSet.prototype.constructor = $c_sc_AbstractSet;
/** @constructor */
function $h_sc_AbstractSet() {
  /*<skip>*/
}
$h_sc_AbstractSet.prototype = $c_sc_AbstractSet.prototype;
$c_sc_AbstractSet.prototype.isEmpty__Z = (function() {
  return $f_sc_SetLike__isEmpty__Z(this)
});
$c_sc_AbstractSet.prototype.equals__O__Z = (function(that) {
  return $f_sc_GenSetLike__equals__O__Z(this, that)
});
$c_sc_AbstractSet.prototype.toString__T = (function() {
  return $f_sc_TraversableLike__toString__T(this)
});
$c_sc_AbstractSet.prototype.subsetOf__sc_GenSet__Z = (function(that) {
  return this.forall__F1__Z(that)
});
$c_sc_AbstractSet.prototype.hashCode__I = (function() {
  var this$1 = $m_s_util_hashing_MurmurHash3$();
  return this$1.unorderedHash__sc_TraversableOnce__I__I(this, this$1.setSeed$2)
});
$c_sc_AbstractSet.prototype.andThen__F1__F1 = (function(g) {
  return $f_F1__andThen__F1__F1(this, g)
});
$c_sc_AbstractSet.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_SetBuilder().init___sc_Set(this.empty__sc_Set())
});
$c_sc_AbstractSet.prototype.stringPrefix__T = (function() {
  return "Set"
});
/** @constructor */
function $c_sci_ListSet() {
  $c_sc_AbstractSet.call(this)
}
$c_sci_ListSet.prototype = new $h_sc_AbstractSet();
$c_sci_ListSet.prototype.constructor = $c_sci_ListSet;
/** @constructor */
function $h_sci_ListSet() {
  /*<skip>*/
}
$h_sci_ListSet.prototype = $c_sci_ListSet.prototype;
$c_sci_ListSet.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_ListSet.prototype.next__sci_ListSet = (function() {
  throw new $c_ju_NoSuchElementException().init___T("next of empty set")
});
$c_sci_ListSet.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_ListSet.prototype.isEmpty__Z = (function() {
  return true
});
$c_sci_ListSet.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_ListSet.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_ListSet$()
});
$c_sci_ListSet.prototype.$$plus__O__sci_ListSet = (function(elem) {
  return new $c_sci_ListSet$Node().init___sci_ListSet__O(this, elem)
});
$c_sci_ListSet.prototype.size__I = (function() {
  return 0
});
$c_sci_ListSet.prototype.iterator__sc_Iterator = (function() {
  var this$1 = this.reverseList$1__p4__sci_List();
  return new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$1)
});
$c_sci_ListSet.prototype.empty__sc_Set = (function() {
  return $m_sci_ListSet$EmptyListSet$()
});
$c_sci_ListSet.prototype.reverseList$1__p4__sci_List = (function() {
  var curr = this;
  var res = $m_sci_Nil$();
  while ((!curr.isEmpty__Z())) {
    var x$4 = curr.elem__O();
    var this$1 = res;
    res = new $c_sci_$colon$colon().init___O__sci_List(x$4, this$1);
    curr = curr.next__sci_ListSet()
  };
  return res
});
$c_sci_ListSet.prototype.contains__O__Z = (function(elem) {
  return false
});
$c_sci_ListSet.prototype.elem__O = (function() {
  throw new $c_ju_NoSuchElementException().init___T("elem of empty set")
});
$c_sci_ListSet.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_ListSet(elem)
});
$c_sci_ListSet.prototype.stringPrefix__T = (function() {
  return "ListSet"
});
/** @constructor */
function $c_sci_Set$EmptySet$() {
  $c_sc_AbstractSet.call(this)
}
$c_sci_Set$EmptySet$.prototype = new $h_sc_AbstractSet();
$c_sci_Set$EmptySet$.prototype.constructor = $c_sci_Set$EmptySet$;
/** @constructor */
function $h_sci_Set$EmptySet$() {
  /*<skip>*/
}
$h_sci_Set$EmptySet$.prototype = $c_sci_Set$EmptySet$.prototype;
$c_sci_Set$EmptySet$.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$EmptySet$.prototype.init___ = (function() {
  return this
});
$c_sci_Set$EmptySet$.prototype.apply__O__O = (function(v1) {
  return false
});
$c_sci_Set$EmptySet$.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$EmptySet$.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$EmptySet$.prototype.foreach__F1__V = (function(f) {
  /*<skip>*/
});
$c_sci_Set$EmptySet$.prototype.size__I = (function() {
  return 0
});
$c_sci_Set$EmptySet$.prototype.iterator__sc_Iterator = (function() {
  return $m_sc_Iterator$().empty$1
});
$c_sci_Set$EmptySet$.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$EmptySet$.prototype.$$plus__O__sc_Set = (function(elem) {
  return new $c_sci_Set$Set1().init___O(elem)
});
var $d_sci_Set$EmptySet$ = new $TypeData().initClass({
  sci_Set$EmptySet$: 0
}, false, "scala.collection.immutable.Set$EmptySet$", {
  sci_Set$EmptySet$: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$EmptySet$.prototype.$classData = $d_sci_Set$EmptySet$;
var $n_sci_Set$EmptySet$ = (void 0);
function $m_sci_Set$EmptySet$() {
  if ((!$n_sci_Set$EmptySet$)) {
    $n_sci_Set$EmptySet$ = new $c_sci_Set$EmptySet$().init___()
  };
  return $n_sci_Set$EmptySet$
}
/** @constructor */
function $c_sci_Set$Set1() {
  $c_sc_AbstractSet.call(this);
  this.elem1$4 = null
}
$c_sci_Set$Set1.prototype = new $h_sc_AbstractSet();
$c_sci_Set$Set1.prototype.constructor = $c_sci_Set$Set1;
/** @constructor */
function $h_sci_Set$Set1() {
  /*<skip>*/
}
$h_sci_Set$Set1.prototype = $c_sci_Set$Set1.prototype;
$c_sci_Set$Set1.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$Set1.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_Set$Set1.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$Set1.prototype.forall__F1__Z = (function(p) {
  return $uZ(p.apply__O__O(this.elem1$4))
});
$c_sci_Set$Set1.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$Set1.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4)
});
$c_sci_Set$Set1.prototype.size__I = (function() {
  return 1
});
$c_sci_Set$Set1.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Set$Set1.prototype.init___O = (function(elem1) {
  this.elem1$4 = elem1;
  return this
});
$c_sci_Set$Set1.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$Set1.prototype.$$plus__O__sci_Set = (function(elem) {
  return (this.contains__O__Z(elem) ? this : new $c_sci_Set$Set2().init___O__O(this.elem1$4, elem))
});
$c_sci_Set$Set1.prototype.contains__O__Z = (function(elem) {
  return $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4)
});
$c_sci_Set$Set1.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
var $d_sci_Set$Set1 = new $TypeData().initClass({
  sci_Set$Set1: 0
}, false, "scala.collection.immutable.Set$Set1", {
  sci_Set$Set1: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set1.prototype.$classData = $d_sci_Set$Set1;
/** @constructor */
function $c_sci_Set$Set2() {
  $c_sc_AbstractSet.call(this);
  this.elem1$4 = null;
  this.elem2$4 = null
}
$c_sci_Set$Set2.prototype = new $h_sc_AbstractSet();
$c_sci_Set$Set2.prototype.constructor = $c_sci_Set$Set2;
/** @constructor */
function $h_sci_Set$Set2() {
  /*<skip>*/
}
$h_sci_Set$Set2.prototype = $c_sci_Set$Set2.prototype;
$c_sci_Set$Set2.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$Set2.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_Set$Set2.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$Set2.prototype.init___O__O = (function(elem1, elem2) {
  this.elem1$4 = elem1;
  this.elem2$4 = elem2;
  return this
});
$c_sci_Set$Set2.prototype.forall__F1__Z = (function(p) {
  return ($uZ(p.apply__O__O(this.elem1$4)) && $uZ(p.apply__O__O(this.elem2$4)))
});
$c_sci_Set$Set2.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$Set2.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4);
  f.apply__O__O(this.elem2$4)
});
$c_sci_Set$Set2.prototype.size__I = (function() {
  return 2
});
$c_sci_Set$Set2.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4, this.elem2$4]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Set$Set2.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$Set2.prototype.$$plus__O__sci_Set = (function(elem) {
  return (this.contains__O__Z(elem) ? this : new $c_sci_Set$Set3().init___O__O__O(this.elem1$4, this.elem2$4, elem))
});
$c_sci_Set$Set2.prototype.contains__O__Z = (function(elem) {
  return ($m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem2$4))
});
$c_sci_Set$Set2.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
var $d_sci_Set$Set2 = new $TypeData().initClass({
  sci_Set$Set2: 0
}, false, "scala.collection.immutable.Set$Set2", {
  sci_Set$Set2: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set2.prototype.$classData = $d_sci_Set$Set2;
/** @constructor */
function $c_sci_Set$Set3() {
  $c_sc_AbstractSet.call(this);
  this.elem1$4 = null;
  this.elem2$4 = null;
  this.elem3$4 = null
}
$c_sci_Set$Set3.prototype = new $h_sc_AbstractSet();
$c_sci_Set$Set3.prototype.constructor = $c_sci_Set$Set3;
/** @constructor */
function $h_sci_Set$Set3() {
  /*<skip>*/
}
$h_sci_Set$Set3.prototype = $c_sci_Set$Set3.prototype;
$c_sci_Set$Set3.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$Set3.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_Set$Set3.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$Set3.prototype.forall__F1__Z = (function(p) {
  return (($uZ(p.apply__O__O(this.elem1$4)) && $uZ(p.apply__O__O(this.elem2$4))) && $uZ(p.apply__O__O(this.elem3$4)))
});
$c_sci_Set$Set3.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$Set3.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4);
  f.apply__O__O(this.elem2$4);
  f.apply__O__O(this.elem3$4)
});
$c_sci_Set$Set3.prototype.size__I = (function() {
  return 3
});
$c_sci_Set$Set3.prototype.init___O__O__O = (function(elem1, elem2, elem3) {
  this.elem1$4 = elem1;
  this.elem2$4 = elem2;
  this.elem3$4 = elem3;
  return this
});
$c_sci_Set$Set3.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4, this.elem2$4, this.elem3$4]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Set$Set3.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$Set3.prototype.$$plus__O__sci_Set = (function(elem) {
  return (this.contains__O__Z(elem) ? this : new $c_sci_Set$Set4().init___O__O__O__O(this.elem1$4, this.elem2$4, this.elem3$4, elem))
});
$c_sci_Set$Set3.prototype.contains__O__Z = (function(elem) {
  return (($m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem2$4)) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem3$4))
});
$c_sci_Set$Set3.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
var $d_sci_Set$Set3 = new $TypeData().initClass({
  sci_Set$Set3: 0
}, false, "scala.collection.immutable.Set$Set3", {
  sci_Set$Set3: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set3.prototype.$classData = $d_sci_Set$Set3;
/** @constructor */
function $c_sci_Set$Set4() {
  $c_sc_AbstractSet.call(this);
  this.elem1$4 = null;
  this.elem2$4 = null;
  this.elem3$4 = null;
  this.elem4$4 = null
}
$c_sci_Set$Set4.prototype = new $h_sc_AbstractSet();
$c_sci_Set$Set4.prototype.constructor = $c_sci_Set$Set4;
/** @constructor */
function $h_sci_Set$Set4() {
  /*<skip>*/
}
$h_sci_Set$Set4.prototype = $c_sci_Set$Set4.prototype;
$c_sci_Set$Set4.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Set$Set4.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_Set$Set4.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Set$Set4.prototype.forall__F1__Z = (function(p) {
  return ((($uZ(p.apply__O__O(this.elem1$4)) && $uZ(p.apply__O__O(this.elem2$4))) && $uZ(p.apply__O__O(this.elem3$4))) && $uZ(p.apply__O__O(this.elem4$4)))
});
$c_sci_Set$Set4.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Set$()
});
$c_sci_Set$Set4.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.elem1$4);
  f.apply__O__O(this.elem2$4);
  f.apply__O__O(this.elem3$4);
  f.apply__O__O(this.elem4$4)
});
$c_sci_Set$Set4.prototype.size__I = (function() {
  return 4
});
$c_sci_Set$Set4.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.elem1$4, this.elem2$4, this.elem3$4, this.elem4$4]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_Set$Set4.prototype.empty__sc_Set = (function() {
  return $m_sci_Set$EmptySet$()
});
$c_sci_Set$Set4.prototype.$$plus__O__sci_Set = (function(elem) {
  if (this.contains__O__Z(elem)) {
    return this
  } else {
    var this$1 = new $c_sci_HashSet().init___();
    var elem1 = this.elem1$4;
    var elem2 = this.elem2$4;
    var array = [this.elem3$4, this.elem4$4, elem];
    var this$2 = this$1.$$plus__O__sci_HashSet(elem1).$$plus__O__sci_HashSet(elem2);
    var start = 0;
    var end = $uI(array.length);
    var z = this$2;
    var start$1 = start;
    var z$1 = z;
    var jsx$1;
    _foldl: while (true) {
      if ((start$1 !== end)) {
        var temp$start = ((1 + start$1) | 0);
        var arg1 = z$1;
        var index = start$1;
        var arg2 = array[index];
        var x$4 = $as_sc_Set(arg1);
        var temp$z = x$4.$$plus__O__sc_Set(arg2);
        start$1 = temp$start;
        z$1 = temp$z;
        continue _foldl
      };
      var jsx$1 = z$1;
      break
    };
    return $as_sci_HashSet($as_sc_Set(jsx$1))
  }
});
$c_sci_Set$Set4.prototype.contains__O__Z = (function(elem) {
  return ((($m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem1$4) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem2$4)) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem3$4)) || $m_sr_BoxesRunTime$().equals__O__O__Z(elem, this.elem4$4))
});
$c_sci_Set$Set4.prototype.init___O__O__O__O = (function(elem1, elem2, elem3, elem4) {
  this.elem1$4 = elem1;
  this.elem2$4 = elem2;
  this.elem3$4 = elem3;
  this.elem4$4 = elem4;
  return this
});
$c_sci_Set$Set4.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_Set(elem)
});
var $d_sci_Set$Set4 = new $TypeData().initClass({
  sci_Set$Set4: 0
}, false, "scala.collection.immutable.Set$Set4", {
  sci_Set$Set4: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Set$Set4.prototype.$classData = $d_sci_Set$Set4;
/** @constructor */
function $c_sci_HashSet() {
  $c_sc_AbstractSet.call(this)
}
$c_sci_HashSet.prototype = new $h_sc_AbstractSet();
$c_sci_HashSet.prototype.constructor = $c_sci_HashSet;
/** @constructor */
function $h_sci_HashSet() {
  /*<skip>*/
}
$h_sci_HashSet.prototype = $c_sci_HashSet.prototype;
$c_sci_HashSet.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  return new $c_sci_HashSet$HashSet1().init___O__I(key, hash)
});
$c_sci_HashSet.prototype.computeHash__O__I = (function(key) {
  return this.improve__I__I($m_sr_Statics$().anyHash__O__I(key))
});
$c_sci_HashSet.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_HashSet.prototype.init___ = (function() {
  return this
});
$c_sci_HashSet.prototype.apply__O__O = (function(v1) {
  return this.contains__O__Z(v1)
});
$c_sci_HashSet.prototype.$$plus__O__sci_HashSet = (function(e) {
  return this.updated0__O__I__I__sci_HashSet(e, this.computeHash__O__I(e), 0)
});
$c_sci_HashSet.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_HashSet.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_HashSet$()
});
$c_sci_HashSet.prototype.foreach__F1__V = (function(f) {
  /*<skip>*/
});
$c_sci_HashSet.prototype.subsetOf__sc_GenSet__Z = (function(that) {
  if ($is_sci_HashSet(that)) {
    var x2 = $as_sci_HashSet(that);
    return this.subsetOf0__sci_HashSet__I__Z(x2, 0)
  } else {
    var this$1 = this.iterator__sc_Iterator();
    return $f_sc_Iterator__forall__F1__Z(this$1, that)
  }
});
$c_sci_HashSet.prototype.size__I = (function() {
  return 0
});
$c_sci_HashSet.prototype.iterator__sc_Iterator = (function() {
  return $m_sc_Iterator$().empty$1
});
$c_sci_HashSet.prototype.empty__sc_Set = (function() {
  return $m_sci_HashSet$EmptyHashSet$()
});
$c_sci_HashSet.prototype.improve__I__I = (function(hcode) {
  var h = ((hcode + (~(hcode << 9))) | 0);
  h = (h ^ ((h >>> 14) | 0));
  h = ((h + (h << 4)) | 0);
  return (h ^ ((h >>> 10) | 0))
});
$c_sci_HashSet.prototype.contains__O__Z = (function(e) {
  return this.get0__O__I__I__Z(e, this.computeHash__O__I(e), 0)
});
$c_sci_HashSet.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  return false
});
$c_sci_HashSet.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_HashSet(elem)
});
$c_sci_HashSet.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  return true
});
function $is_sci_HashSet(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashSet)))
}
function $as_sci_HashSet(obj) {
  return (($is_sci_HashSet(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashSet"))
}
function $isArrayOf_sci_HashSet(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashSet)))
}
function $asArrayOf_sci_HashSet(obj, depth) {
  return (($isArrayOf_sci_HashSet(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashSet;", depth))
}
var $d_sci_HashSet = new $TypeData().initClass({
  sci_HashSet: 0
}, false, "scala.collection.immutable.HashSet", {
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet.prototype.$classData = $d_sci_HashSet;
/** @constructor */
function $c_sci_ListSet$EmptyListSet$() {
  $c_sci_ListSet.call(this)
}
$c_sci_ListSet$EmptyListSet$.prototype = new $h_sci_ListSet();
$c_sci_ListSet$EmptyListSet$.prototype.constructor = $c_sci_ListSet$EmptyListSet$;
/** @constructor */
function $h_sci_ListSet$EmptyListSet$() {
  /*<skip>*/
}
$h_sci_ListSet$EmptyListSet$.prototype = $c_sci_ListSet$EmptyListSet$.prototype;
$c_sci_ListSet$EmptyListSet$.prototype.init___ = (function() {
  return this
});
var $d_sci_ListSet$EmptyListSet$ = new $TypeData().initClass({
  sci_ListSet$EmptyListSet$: 0
}, false, "scala.collection.immutable.ListSet$EmptyListSet$", {
  sci_ListSet$EmptyListSet$: 1,
  sci_ListSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListSet$EmptyListSet$.prototype.$classData = $d_sci_ListSet$EmptyListSet$;
var $n_sci_ListSet$EmptyListSet$ = (void 0);
function $m_sci_ListSet$EmptyListSet$() {
  if ((!$n_sci_ListSet$EmptyListSet$)) {
    $n_sci_ListSet$EmptyListSet$ = new $c_sci_ListSet$EmptyListSet$().init___()
  };
  return $n_sci_ListSet$EmptyListSet$
}
/** @constructor */
function $c_sci_ListSet$Node() {
  $c_sci_ListSet.call(this);
  this.elem$5 = null;
  this.$$outer$5 = null
}
$c_sci_ListSet$Node.prototype = new $h_sci_ListSet();
$c_sci_ListSet$Node.prototype.constructor = $c_sci_ListSet$Node;
/** @constructor */
function $h_sci_ListSet$Node() {
  /*<skip>*/
}
$h_sci_ListSet$Node.prototype = $c_sci_ListSet$Node.prototype;
$c_sci_ListSet$Node.prototype.next__sci_ListSet = (function() {
  return this.$$outer$5
});
$c_sci_ListSet$Node.prototype.isEmpty__Z = (function() {
  return false
});
$c_sci_ListSet$Node.prototype.$$plus__O__sci_ListSet = (function(e) {
  return (this.containsInternal__p5__sci_ListSet__O__Z(this, e) ? this : new $c_sci_ListSet$Node().init___sci_ListSet__O(this, e))
});
$c_sci_ListSet$Node.prototype.sizeInternal__p5__sci_ListSet__I__I = (function(n, acc) {
  _sizeInternal: while (true) {
    if (n.isEmpty__Z()) {
      return acc
    } else {
      var temp$n = n.next__sci_ListSet();
      var temp$acc = ((1 + acc) | 0);
      n = temp$n;
      acc = temp$acc;
      continue _sizeInternal
    }
  }
});
$c_sci_ListSet$Node.prototype.size__I = (function() {
  return this.sizeInternal__p5__sci_ListSet__I__I(this, 0)
});
$c_sci_ListSet$Node.prototype.init___sci_ListSet__O = (function($$outer, elem) {
  this.elem$5 = elem;
  if (($$outer === null)) {
    throw $m_sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$5 = $$outer
  };
  return this
});
$c_sci_ListSet$Node.prototype.elem__O = (function() {
  return this.elem$5
});
$c_sci_ListSet$Node.prototype.contains__O__Z = (function(e) {
  return this.containsInternal__p5__sci_ListSet__O__Z(this, e)
});
$c_sci_ListSet$Node.prototype.containsInternal__p5__sci_ListSet__O__Z = (function(n, e) {
  _containsInternal: while (true) {
    if ((!n.isEmpty__Z())) {
      if ($m_sr_BoxesRunTime$().equals__O__O__Z(n.elem__O(), e)) {
        return true
      } else {
        n = n.next__sci_ListSet();
        continue _containsInternal
      }
    } else {
      return false
    }
  }
});
$c_sci_ListSet$Node.prototype.$$plus__O__sc_Set = (function(elem) {
  return this.$$plus__O__sci_ListSet(elem)
});
var $d_sci_ListSet$Node = new $TypeData().initClass({
  sci_ListSet$Node: 0
}, false, "scala.collection.immutable.ListSet$Node", {
  sci_ListSet$Node: 1,
  sci_ListSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_ListSet$Node.prototype.$classData = $d_sci_ListSet$Node;
/** @constructor */
function $c_scm_AbstractSeq() {
  $c_sc_AbstractSeq.call(this)
}
$c_scm_AbstractSeq.prototype = new $h_sc_AbstractSeq();
$c_scm_AbstractSeq.prototype.constructor = $c_scm_AbstractSeq;
/** @constructor */
function $h_scm_AbstractSeq() {
  /*<skip>*/
}
$h_scm_AbstractSeq.prototype = $c_scm_AbstractSeq.prototype;
$c_scm_AbstractSeq.prototype.seq__sc_TraversableOnce = (function() {
  return this.seq__scm_Seq()
});
$c_scm_AbstractSeq.prototype.seq__scm_Seq = (function() {
  return this
});
/** @constructor */
function $c_sci_HashSet$EmptyHashSet$() {
  $c_sci_HashSet.call(this)
}
$c_sci_HashSet$EmptyHashSet$.prototype = new $h_sci_HashSet();
$c_sci_HashSet$EmptyHashSet$.prototype.constructor = $c_sci_HashSet$EmptyHashSet$;
/** @constructor */
function $h_sci_HashSet$EmptyHashSet$() {
  /*<skip>*/
}
$h_sci_HashSet$EmptyHashSet$.prototype = $c_sci_HashSet$EmptyHashSet$.prototype;
$c_sci_HashSet$EmptyHashSet$.prototype.init___ = (function() {
  return this
});
var $d_sci_HashSet$EmptyHashSet$ = new $TypeData().initClass({
  sci_HashSet$EmptyHashSet$: 0
}, false, "scala.collection.immutable.HashSet$EmptyHashSet$", {
  sci_HashSet$EmptyHashSet$: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$EmptyHashSet$.prototype.$classData = $d_sci_HashSet$EmptyHashSet$;
var $n_sci_HashSet$EmptyHashSet$ = (void 0);
function $m_sci_HashSet$EmptyHashSet$() {
  if ((!$n_sci_HashSet$EmptyHashSet$)) {
    $n_sci_HashSet$EmptyHashSet$ = new $c_sci_HashSet$EmptyHashSet$().init___()
  };
  return $n_sci_HashSet$EmptyHashSet$
}
/** @constructor */
function $c_sci_HashSet$HashTrieSet() {
  $c_sci_HashSet.call(this);
  this.bitmap$5 = 0;
  this.elems$5 = null;
  this.size0$5 = 0
}
$c_sci_HashSet$HashTrieSet.prototype = new $h_sci_HashSet();
$c_sci_HashSet$HashTrieSet.prototype.constructor = $c_sci_HashSet$HashTrieSet;
/** @constructor */
function $h_sci_HashSet$HashTrieSet() {
  /*<skip>*/
}
$h_sci_HashSet$HashTrieSet.prototype = $c_sci_HashSet$HashTrieSet.prototype;
$c_sci_HashSet$HashTrieSet.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  var index = (31 & ((hash >>> level) | 0));
  var mask = (1 << index);
  var offset = $m_jl_Integer$().bitCount__I__I((this.bitmap$5 & (((-1) + mask) | 0)));
  if (((this.bitmap$5 & mask) !== 0)) {
    var sub = this.elems$5.get(offset);
    var subNew = sub.updated0__O__I__I__sci_HashSet(key, hash, ((5 + level) | 0));
    if ((sub === subNew)) {
      return this
    } else {
      var elemsNew = $newArrayObject($d_sci_HashSet.getArrayOf(), [this.elems$5.u.length]);
      $m_s_Array$().copy__O__I__O__I__I__V(this.elems$5, 0, elemsNew, 0, this.elems$5.u.length);
      elemsNew.set(offset, subNew);
      return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(this.bitmap$5, elemsNew, ((this.size0$5 + ((subNew.size__I() - sub.size__I()) | 0)) | 0))
    }
  } else {
    var elemsNew$2 = $newArrayObject($d_sci_HashSet.getArrayOf(), [((1 + this.elems$5.u.length) | 0)]);
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$5, 0, elemsNew$2, 0, offset);
    elemsNew$2.set(offset, new $c_sci_HashSet$HashSet1().init___O__I(key, hash));
    $m_s_Array$().copy__O__I__O__I__I__V(this.elems$5, offset, elemsNew$2, ((1 + offset) | 0), ((this.elems$5.u.length - offset) | 0));
    var bitmapNew = (this.bitmap$5 | mask);
    return new $c_sci_HashSet$HashTrieSet().init___I__Asci_HashSet__I(bitmapNew, elemsNew$2, ((1 + this.size0$5) | 0))
  }
});
$c_sci_HashSet$HashTrieSet.prototype.foreach__F1__V = (function(f) {
  var i = 0;
  while ((i < this.elems$5.u.length)) {
    this.elems$5.get(i).foreach__F1__V(f);
    i = ((1 + i) | 0)
  }
});
$c_sci_HashSet$HashTrieSet.prototype.size__I = (function() {
  return this.size0$5
});
$c_sci_HashSet$HashTrieSet.prototype.iterator__sc_Iterator = (function() {
  return new $c_sci_HashSet$HashTrieSet$$anon$1().init___sci_HashSet$HashTrieSet(this)
});
$c_sci_HashSet$HashTrieSet.prototype.init___I__Asci_HashSet__I = (function(bitmap, elems, size0) {
  this.bitmap$5 = bitmap;
  this.elems$5 = elems;
  this.size0$5 = size0;
  $m_s_Predef$().assert__Z__V(($m_jl_Integer$().bitCount__I__I(bitmap) === elems.u.length));
  return this
});
$c_sci_HashSet$HashTrieSet.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  var index = (31 & ((hash >>> level) | 0));
  var mask = (1 << index);
  if ((this.bitmap$5 === (-1))) {
    return this.elems$5.get((31 & index)).get0__O__I__I__Z(key, hash, ((5 + level) | 0))
  } else if (((this.bitmap$5 & mask) !== 0)) {
    var offset = $m_jl_Integer$().bitCount__I__I((this.bitmap$5 & (((-1) + mask) | 0)));
    return this.elems$5.get(offset).get0__O__I__I__Z(key, hash, ((5 + level) | 0))
  } else {
    return false
  }
});
$c_sci_HashSet$HashTrieSet.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  if ((that === this)) {
    return true
  } else {
    if ($is_sci_HashSet$HashTrieSet(that)) {
      var x2 = $as_sci_HashSet$HashTrieSet(that);
      if ((this.size0$5 <= x2.size0$5)) {
        var abm = this.bitmap$5;
        var a = this.elems$5;
        var ai = 0;
        var b = x2.elems$5;
        var bbm = x2.bitmap$5;
        var bi = 0;
        if (((abm & bbm) === abm)) {
          while ((abm !== 0)) {
            var alsb = (abm ^ (abm & (((-1) + abm) | 0)));
            var blsb = (bbm ^ (bbm & (((-1) + bbm) | 0)));
            if ((alsb === blsb)) {
              if ((!a.get(ai).subsetOf0__sci_HashSet__I__Z(b.get(bi), ((5 + level) | 0)))) {
                return false
              };
              abm = (abm & (~alsb));
              ai = ((1 + ai) | 0)
            };
            bbm = (bbm & (~blsb));
            bi = ((1 + bi) | 0)
          };
          return true
        } else {
          return false
        }
      }
    };
    return false
  }
});
function $is_sci_HashSet$HashTrieSet(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashSet$HashTrieSet)))
}
function $as_sci_HashSet$HashTrieSet(obj) {
  return (($is_sci_HashSet$HashTrieSet(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashSet$HashTrieSet"))
}
function $isArrayOf_sci_HashSet$HashTrieSet(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashSet$HashTrieSet)))
}
function $asArrayOf_sci_HashSet$HashTrieSet(obj, depth) {
  return (($isArrayOf_sci_HashSet$HashTrieSet(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashSet$HashTrieSet;", depth))
}
var $d_sci_HashSet$HashTrieSet = new $TypeData().initClass({
  sci_HashSet$HashTrieSet: 0
}, false, "scala.collection.immutable.HashSet$HashTrieSet", {
  sci_HashSet$HashTrieSet: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$HashTrieSet.prototype.$classData = $d_sci_HashSet$HashTrieSet;
/** @constructor */
function $c_sci_HashSet$LeafHashSet() {
  $c_sci_HashSet.call(this)
}
$c_sci_HashSet$LeafHashSet.prototype = new $h_sci_HashSet();
$c_sci_HashSet$LeafHashSet.prototype.constructor = $c_sci_HashSet$LeafHashSet;
/** @constructor */
function $h_sci_HashSet$LeafHashSet() {
  /*<skip>*/
}
$h_sci_HashSet$LeafHashSet.prototype = $c_sci_HashSet$LeafHashSet.prototype;
/** @constructor */
function $c_sci_HashSet$HashSet1() {
  $c_sci_HashSet$LeafHashSet.call(this);
  this.key$6 = null;
  this.hash$6 = 0
}
$c_sci_HashSet$HashSet1.prototype = new $h_sci_HashSet$LeafHashSet();
$c_sci_HashSet$HashSet1.prototype.constructor = $c_sci_HashSet$HashSet1;
/** @constructor */
function $h_sci_HashSet$HashSet1() {
  /*<skip>*/
}
$h_sci_HashSet$HashSet1.prototype = $c_sci_HashSet$HashSet1.prototype;
$c_sci_HashSet$HashSet1.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  if (((hash === this.hash$6) && $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6))) {
    return this
  } else if ((hash !== this.hash$6)) {
    return $m_sci_HashSet$().scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet(this.hash$6, this, hash, new $c_sci_HashSet$HashSet1().init___O__I(key, hash), level)
  } else {
    var this$2 = $m_sci_ListSet$EmptyListSet$();
    var elem = this.key$6;
    return new $c_sci_HashSet$HashSetCollision1().init___I__sci_ListSet(hash, new $c_sci_ListSet$Node().init___sci_ListSet__O(this$2, elem).$$plus__O__sci_ListSet(key))
  }
});
$c_sci_HashSet$HashSet1.prototype.foreach__F1__V = (function(f) {
  f.apply__O__O(this.key$6)
});
$c_sci_HashSet$HashSet1.prototype.init___O__I = (function(key, hash) {
  this.key$6 = key;
  this.hash$6 = hash;
  return this
});
$c_sci_HashSet$HashSet1.prototype.size__I = (function() {
  return 1
});
$c_sci_HashSet$HashSet1.prototype.iterator__sc_Iterator = (function() {
  $m_sc_Iterator$();
  var elems = new $c_sjs_js_WrappedArray().init___sjs_js_Array([this.key$6]);
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(elems, 0, $uI(elems.array$6.length))
});
$c_sci_HashSet$HashSet1.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  return ((hash === this.hash$6) && $m_sr_BoxesRunTime$().equals__O__O__Z(key, this.key$6))
});
$c_sci_HashSet$HashSet1.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  return that.get0__O__I__I__Z(this.key$6, this.hash$6, level)
});
function $is_sci_HashSet$HashSet1(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashSet$HashSet1)))
}
function $as_sci_HashSet$HashSet1(obj) {
  return (($is_sci_HashSet$HashSet1(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashSet$HashSet1"))
}
function $isArrayOf_sci_HashSet$HashSet1(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashSet$HashSet1)))
}
function $asArrayOf_sci_HashSet$HashSet1(obj, depth) {
  return (($isArrayOf_sci_HashSet$HashSet1(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashSet$HashSet1;", depth))
}
var $d_sci_HashSet$HashSet1 = new $TypeData().initClass({
  sci_HashSet$HashSet1: 0
}, false, "scala.collection.immutable.HashSet$HashSet1", {
  sci_HashSet$HashSet1: 1,
  sci_HashSet$LeafHashSet: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$HashSet1.prototype.$classData = $d_sci_HashSet$HashSet1;
/** @constructor */
function $c_sci_HashSet$HashSetCollision1() {
  $c_sci_HashSet$LeafHashSet.call(this);
  this.hash$6 = 0;
  this.ks$6 = null
}
$c_sci_HashSet$HashSetCollision1.prototype = new $h_sci_HashSet$LeafHashSet();
$c_sci_HashSet$HashSetCollision1.prototype.constructor = $c_sci_HashSet$HashSetCollision1;
/** @constructor */
function $h_sci_HashSet$HashSetCollision1() {
  /*<skip>*/
}
$h_sci_HashSet$HashSetCollision1.prototype = $c_sci_HashSet$HashSetCollision1.prototype;
$c_sci_HashSet$HashSetCollision1.prototype.updated0__O__I__I__sci_HashSet = (function(key, hash, level) {
  return ((hash === this.hash$6) ? new $c_sci_HashSet$HashSetCollision1().init___I__sci_ListSet(hash, this.ks$6.$$plus__O__sci_ListSet(key)) : $m_sci_HashSet$().scala$collection$immutable$HashSet$$makeHashTrieSet__I__sci_HashSet__I__sci_HashSet__I__sci_HashSet$HashTrieSet(this.hash$6, this, hash, new $c_sci_HashSet$HashSet1().init___O__I(key, hash), level))
});
$c_sci_HashSet$HashSetCollision1.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.ks$6;
  var this$2 = this$1.reverseList$1__p4__sci_List();
  var this$3 = new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$2);
  $f_sc_Iterator__foreach__F1__V(this$3, f)
});
$c_sci_HashSet$HashSetCollision1.prototype.size__I = (function() {
  return this.ks$6.size__I()
});
$c_sci_HashSet$HashSetCollision1.prototype.iterator__sc_Iterator = (function() {
  var this$1 = this.ks$6;
  var this$2 = this$1.reverseList$1__p4__sci_List();
  return new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$2)
});
$c_sci_HashSet$HashSetCollision1.prototype.init___I__sci_ListSet = (function(hash, ks) {
  this.hash$6 = hash;
  this.ks$6 = ks;
  return this
});
$c_sci_HashSet$HashSetCollision1.prototype.get0__O__I__I__Z = (function(key, hash, level) {
  return ((hash === this.hash$6) && this.ks$6.contains__O__Z(key))
});
$c_sci_HashSet$HashSetCollision1.prototype.subsetOf0__sci_HashSet__I__Z = (function(that, level) {
  var this$1 = this.ks$6;
  var this$2 = this$1.reverseList$1__p4__sci_List();
  var this$3 = new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this$2);
  var res = true;
  while ((res && this$3.hasNext__Z())) {
    var arg1 = this$3.next__O();
    res = that.get0__O__I__I__Z(arg1, this.hash$6, level)
  };
  return res
});
var $d_sci_HashSet$HashSetCollision1 = new $TypeData().initClass({
  sci_HashSet$HashSetCollision1: 0
}, false, "scala.collection.immutable.HashSet$HashSetCollision1", {
  sci_HashSet$HashSetCollision1: 1,
  sci_HashSet$LeafHashSet: 1,
  sci_HashSet: 1,
  sc_AbstractSet: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Set: 1,
  F1: 1,
  sc_GenSet: 1,
  sc_GenSetLike: 1,
  scg_GenericSetTemplate: 1,
  sc_SetLike: 1,
  scg_Subtractable: 1,
  sci_Set: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_HashSet$HashSetCollision1.prototype.$classData = $d_sci_HashSet$HashSetCollision1;
/** @constructor */
function $c_sci_Stream() {
  $c_sc_AbstractSeq.call(this)
}
$c_sci_Stream.prototype = new $h_sc_AbstractSeq();
$c_sci_Stream.prototype.constructor = $c_sci_Stream;
/** @constructor */
function $h_sci_Stream() {
  /*<skip>*/
}
$h_sci_Stream.prototype = $c_sci_Stream.prototype;
$c_sci_Stream.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Stream.prototype.apply__I__O = (function(n) {
  return $f_sc_LinearSeqOptimized__apply__I__O(this, n)
});
$c_sci_Stream.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_LinearSeqOptimized__lengthCompare__I__I(this, len)
});
$c_sci_Stream.prototype.apply__O__O = (function(v1) {
  var n = $uI(v1);
  return $f_sc_LinearSeqOptimized__apply__I__O(this, n)
});
$c_sci_Stream.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_LinearSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_sci_Stream.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Stream.prototype.equals__O__Z = (function(that) {
  return ((this === that) || $f_sc_GenSeqLike__equals__O__Z(this, that))
});
$c_sci_Stream.prototype.flatMap__F1__scg_CanBuildFrom__O = (function(f, bf) {
  if ($is_sci_Stream$StreamBuilder(bf.apply__O__scm_Builder(this))) {
    if (this.isEmpty__Z()) {
      var x$1 = $m_sci_Stream$Empty$()
    } else {
      var nonEmptyPrefix = new $c_sr_ObjectRef().init___O(this);
      var prefix = $as_sc_GenTraversableOnce(f.apply__O__O($as_sci_Stream(nonEmptyPrefix.elem$1).head__O())).toStream__sci_Stream();
      while (((!$as_sci_Stream(nonEmptyPrefix.elem$1).isEmpty__Z()) && prefix.isEmpty__Z())) {
        nonEmptyPrefix.elem$1 = $as_sci_Stream($as_sci_Stream(nonEmptyPrefix.elem$1).tail__O());
        if ((!$as_sci_Stream(nonEmptyPrefix.elem$1).isEmpty__Z())) {
          prefix = $as_sc_GenTraversableOnce(f.apply__O__O($as_sci_Stream(nonEmptyPrefix.elem$1).head__O())).toStream__sci_Stream()
        }
      };
      var x$1 = ($as_sci_Stream(nonEmptyPrefix.elem$1).isEmpty__Z() ? ($m_sci_Stream$(), $m_sci_Stream$Empty$()) : prefix.append__F0__sci_Stream(new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, f$1, nonEmptyPrefix$1) {
        return (function() {
          var x = $as_sci_Stream($as_sci_Stream(nonEmptyPrefix$1.elem$1).tail__O()).flatMap__F1__scg_CanBuildFrom__O(f$1, ($m_sci_Stream$(), new $c_sci_Stream$StreamCanBuildFrom().init___()));
          return $as_sci_Stream(x)
        })
      })(this, f, nonEmptyPrefix))))
    };
    return x$1
  } else {
    return $f_sc_TraversableLike__flatMap__F1__scg_CanBuildFrom__O(this, f, bf)
  }
});
$c_sci_Stream.prototype.drop__I__sc_LinearSeqOptimized = (function(n) {
  return this.drop__I__sci_Stream(n)
});
$c_sci_Stream.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  this.force__sci_Stream();
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this, start, sep, end)
});
$c_sci_Stream.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Stream$()
});
$c_sci_Stream.prototype.toString__T = (function() {
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this, "Stream(", ", ", ")")
});
$c_sci_Stream.prototype.foreach__F1__V = (function(f) {
  var _$this = this;
  _foreach: while (true) {
    if ((!_$this.isEmpty__Z())) {
      f.apply__O__O(_$this.head__O());
      _$this = $as_sci_Stream(_$this.tail__O());
      continue _foreach
    };
    break
  }
});
$c_sci_Stream.prototype.iterator__sc_Iterator = (function() {
  return new $c_sci_StreamIterator().init___sci_Stream(this)
});
$c_sci_Stream.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sci_Stream.prototype.length__I = (function() {
  var len = 0;
  var left = this;
  while ((!left.isEmpty__Z())) {
    len = ((1 + len) | 0);
    left = $as_sci_Stream(left.tail__O())
  };
  return len
});
$c_sci_Stream.prototype.toStream__sci_Stream = (function() {
  return this
});
$c_sci_Stream.prototype.thisCollection__sc_Seq = (function() {
  return this
});
$c_sci_Stream.prototype.drop__I__sci_Stream = (function(n) {
  var _$this = this;
  _drop: while (true) {
    if (((n <= 0) || _$this.isEmpty__Z())) {
      return _$this
    } else {
      var temp$_$this = $as_sci_Stream(_$this.tail__O());
      var temp$n = (((-1) + n) | 0);
      _$this = temp$_$this;
      n = temp$n;
      continue _drop
    }
  }
});
$c_sci_Stream.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  b.append__T__scm_StringBuilder(start);
  if ((!this.isEmpty__Z())) {
    b.append__O__scm_StringBuilder(this.head__O());
    var cursor = this;
    var n = 1;
    if (cursor.tailDefined__Z()) {
      var scout = $as_sci_Stream(this.tail__O());
      if (scout.isEmpty__Z()) {
        b.append__T__scm_StringBuilder(end);
        return b
      };
      if ((cursor !== scout)) {
        cursor = scout;
        if (scout.tailDefined__Z()) {
          scout = $as_sci_Stream(scout.tail__O());
          while (((cursor !== scout) && scout.tailDefined__Z())) {
            b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
            n = ((1 + n) | 0);
            cursor = $as_sci_Stream(cursor.tail__O());
            scout = $as_sci_Stream(scout.tail__O());
            if (scout.tailDefined__Z()) {
              scout = $as_sci_Stream(scout.tail__O())
            }
          }
        }
      };
      if ((!scout.tailDefined__Z())) {
        while ((cursor !== scout)) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
          n = ((1 + n) | 0);
          cursor = $as_sci_Stream(cursor.tail__O())
        };
        var this$1 = cursor;
        if ($f_sc_TraversableOnce__nonEmpty__Z(this$1)) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O())
        }
      } else {
        var runner = this;
        var k = 0;
        while ((runner !== scout)) {
          runner = $as_sci_Stream(runner.tail__O());
          scout = $as_sci_Stream(scout.tail__O());
          k = ((1 + k) | 0)
        };
        if (((cursor === scout) && (k > 0))) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
          n = ((1 + n) | 0);
          cursor = $as_sci_Stream(cursor.tail__O())
        };
        while ((cursor !== scout)) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
          n = ((1 + n) | 0);
          cursor = $as_sci_Stream(cursor.tail__O())
        };
        n = ((n - k) | 0)
      }
    };
    if ((!cursor.isEmpty__Z())) {
      if ((!cursor.tailDefined__Z())) {
        b.append__T__scm_StringBuilder(sep).append__T__scm_StringBuilder("?")
      } else {
        b.append__T__scm_StringBuilder(sep).append__T__scm_StringBuilder("...")
      }
    }
  };
  b.append__T__scm_StringBuilder(end);
  return b
});
$c_sci_Stream.prototype.force__sci_Stream = (function() {
  var these = this;
  var those = this;
  if ((!these.isEmpty__Z())) {
    these = $as_sci_Stream(these.tail__O())
  };
  while ((those !== these)) {
    if (these.isEmpty__Z()) {
      return this
    };
    these = $as_sci_Stream(these.tail__O());
    if (these.isEmpty__Z()) {
      return this
    };
    these = $as_sci_Stream(these.tail__O());
    if ((these === those)) {
      return this
    };
    those = $as_sci_Stream(those.tail__O())
  };
  return this
});
$c_sci_Stream.prototype.isDefinedAt__O__Z = (function(x) {
  var x$1 = $uI(x);
  return $f_sc_LinearSeqOptimized__isDefinedAt__I__Z(this, x$1)
});
$c_sci_Stream.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sci_Stream.prototype.append__F0__sci_Stream = (function(rest) {
  if (this.isEmpty__Z()) {
    return $as_sc_GenTraversableOnce(rest.apply__O()).toStream__sci_Stream()
  } else {
    var hd = this.head__O();
    var tl = new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this, rest$1) {
      return (function() {
        return $as_sci_Stream($this.tail__O()).append__F0__sci_Stream(rest$1)
      })
    })(this, rest));
    return new $c_sci_Stream$Cons().init___O__F0(hd, tl)
  }
});
$c_sci_Stream.prototype.stringPrefix__T = (function() {
  return "Stream"
});
function $is_sci_Stream(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Stream)))
}
function $as_sci_Stream(obj) {
  return (($is_sci_Stream(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Stream"))
}
function $isArrayOf_sci_Stream(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Stream)))
}
function $asArrayOf_sci_Stream(obj, depth) {
  return (($isArrayOf_sci_Stream(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Stream;", depth))
}
function $f_scm_ResizableArray__apply__I__O($thiz, idx) {
  if ((idx >= $thiz.size0$6)) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + idx))
  };
  return $thiz.array$6.get(idx)
}
function $f_scm_ResizableArray__foreach__F1__V($thiz, f) {
  var i = 0;
  var top = $thiz.size0$6;
  while ((i < top)) {
    f.apply__O__O($thiz.array$6.get(i));
    i = ((1 + i) | 0)
  }
}
function $f_scm_ResizableArray__ensureSize__I__V($thiz, n) {
  var value = $thiz.array$6.u.length;
  var hi = (value >> 31);
  var hi$1 = (n >> 31);
  if (((hi$1 === hi) ? (((-2147483648) ^ n) > ((-2147483648) ^ value)) : (hi$1 > hi))) {
    var lo = (value << 1);
    var hi$2 = (((value >>> 31) | 0) | (hi << 1));
    var newSize_$_lo$2 = lo;
    var newSize_$_hi$2 = hi$2;
    while (true) {
      var hi$3 = (n >> 31);
      var b_$_lo$2 = newSize_$_lo$2;
      var b_$_hi$2 = newSize_$_hi$2;
      var bhi = b_$_hi$2;
      if (((hi$3 === bhi) ? (((-2147483648) ^ n) > ((-2147483648) ^ b_$_lo$2)) : (hi$3 > bhi))) {
        var this$1_$_lo$2 = newSize_$_lo$2;
        var this$1_$_hi$2 = newSize_$_hi$2;
        var lo$1 = (this$1_$_lo$2 << 1);
        var hi$4 = (((this$1_$_lo$2 >>> 31) | 0) | (this$1_$_hi$2 << 1));
        var jsx$1_$_lo$2 = lo$1;
        var jsx$1_$_hi$2 = hi$4;
        newSize_$_lo$2 = jsx$1_$_lo$2;
        newSize_$_hi$2 = jsx$1_$_hi$2
      } else {
        break
      }
    };
    var this$2_$_lo$2 = newSize_$_lo$2;
    var this$2_$_hi$2 = newSize_$_hi$2;
    var ahi = this$2_$_hi$2;
    if (((ahi === 0) ? (((-2147483648) ^ this$2_$_lo$2) > (-1)) : (ahi > 0))) {
      var jsx$2_$_lo$2 = 2147483647;
      var jsx$2_$_hi$2 = 0;
      newSize_$_lo$2 = jsx$2_$_lo$2;
      newSize_$_hi$2 = jsx$2_$_hi$2
    };
    var this$3_$_lo$2 = newSize_$_lo$2;
    var this$3_$_hi$2 = newSize_$_hi$2;
    var newArray = $newArrayObject($d_O.getArrayOf(), [this$3_$_lo$2]);
    $systemArraycopy($thiz.array$6, 0, newArray, 0, $thiz.size0$6);
    $thiz.array$6 = newArray
  }
}
function $f_scm_ResizableArray__$$init$__V($thiz) {
  var x = $thiz.initialSize$6;
  $thiz.array$6 = $newArrayObject($d_O.getArrayOf(), [((x > 1) ? x : 1)]);
  $thiz.size0$6 = 0
}
function $f_scm_ResizableArray__copyToArray__O__I__I__V($thiz, xs, start, len) {
  var that = (($m_sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0);
  var x = ((len < that) ? len : that);
  var that$1 = $thiz.size0$6;
  var len1 = ((x < that$1) ? x : that$1);
  if ((len1 > 0)) {
    $m_s_Array$().copy__O__I__O__I__I__V($thiz.array$6, 0, xs, start, len1)
  }
}
function $is_sci_HashMap$HashMap1(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashMap$HashMap1)))
}
function $as_sci_HashMap$HashMap1(obj) {
  return (($is_sci_HashMap$HashMap1(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashMap$HashMap1"))
}
function $isArrayOf_sci_HashMap$HashMap1(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashMap$HashMap1)))
}
function $asArrayOf_sci_HashMap$HashMap1(obj, depth) {
  return (($isArrayOf_sci_HashMap$HashMap1(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashMap$HashMap1;", depth))
}
function $is_sci_HashMap$HashTrieMap(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_HashMap$HashTrieMap)))
}
function $as_sci_HashMap$HashTrieMap(obj) {
  return (($is_sci_HashMap$HashTrieMap(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.HashMap$HashTrieMap"))
}
function $isArrayOf_sci_HashMap$HashTrieMap(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_HashMap$HashTrieMap)))
}
function $asArrayOf_sci_HashMap$HashTrieMap(obj, depth) {
  return (($isArrayOf_sci_HashMap$HashTrieMap(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.HashMap$HashTrieMap;", depth))
}
/** @constructor */
function $c_sci_List() {
  $c_sc_AbstractSeq.call(this)
}
$c_sci_List.prototype = new $h_sc_AbstractSeq();
$c_sci_List.prototype.constructor = $c_sci_List;
/** @constructor */
function $h_sci_List() {
  /*<skip>*/
}
$h_sci_List.prototype = $c_sci_List.prototype;
$c_sci_List.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_List.prototype.apply__I__O = (function(n) {
  return $f_sc_LinearSeqOptimized__apply__I__O(this, n)
});
$c_sci_List.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_LinearSeqOptimized__lengthCompare__I__I(this, len)
});
$c_sci_List.prototype.apply__O__O = (function(v1) {
  var n = $uI(v1);
  return $f_sc_LinearSeqOptimized__apply__I__O(this, n)
});
$c_sci_List.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_LinearSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_sci_List.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_List.prototype.drop__I__sc_LinearSeqOptimized = (function(n) {
  return this.drop__I__sci_List(n)
});
$c_sci_List.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_List$()
});
$c_sci_List.prototype.foreach__F1__V = (function(f) {
  var these = this;
  while ((!these.isEmpty__Z())) {
    f.apply__O__O(these.head__O());
    var this$1 = these;
    these = this$1.tail__sci_List()
  }
});
$c_sci_List.prototype.drop__I__sci_List = (function(n) {
  var these = this;
  var count = n;
  while (((!these.isEmpty__Z()) && (count > 0))) {
    var this$1 = these;
    these = this$1.tail__sci_List();
    count = (((-1) + count) | 0)
  };
  return these
});
$c_sci_List.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this)
});
$c_sci_List.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sci_List.prototype.length__I = (function() {
  return $f_sc_LinearSeqOptimized__length__I(this)
});
$c_sci_List.prototype.toStream__sci_Stream = (function() {
  return (this.isEmpty__Z() ? $m_sci_Stream$Empty$() : new $c_sci_Stream$Cons().init___O__F0(this.head__O(), new $c_sjsr_AnonFunction0().init___sjs_js_Function0((function($this) {
    return (function() {
      return $this.tail__sci_List().toStream__sci_Stream()
    })
  })(this))))
});
$c_sci_List.prototype.thisCollection__sc_Seq = (function() {
  return this
});
$c_sci_List.prototype.isDefinedAt__O__Z = (function(x) {
  var x$1 = $uI(x);
  return $f_sc_LinearSeqOptimized__isDefinedAt__I__Z(this, x$1)
});
$c_sci_List.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sci_List.prototype.stringPrefix__T = (function() {
  return "List"
});
function $is_sci_List(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_List)))
}
function $as_sci_List(obj) {
  return (($is_sci_List(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.List"))
}
function $isArrayOf_sci_List(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_List)))
}
function $asArrayOf_sci_List(obj, depth) {
  return (($isArrayOf_sci_List(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.List;", depth))
}
/** @constructor */
function $c_sci_Stream$Cons() {
  $c_sci_Stream.call(this);
  this.hd$5 = null;
  this.tlVal$5 = null;
  this.tlGen$5 = null
}
$c_sci_Stream$Cons.prototype = new $h_sci_Stream();
$c_sci_Stream$Cons.prototype.constructor = $c_sci_Stream$Cons;
/** @constructor */
function $h_sci_Stream$Cons() {
  /*<skip>*/
}
$h_sci_Stream$Cons.prototype = $c_sci_Stream$Cons.prototype;
$c_sci_Stream$Cons.prototype.head__O = (function() {
  return this.hd$5
});
$c_sci_Stream$Cons.prototype.tail__sci_Stream = (function() {
  if ((!this.tailDefined__Z())) {
    if ((!this.tailDefined__Z())) {
      this.tlVal$5 = $as_sci_Stream(this.tlGen$5.apply__O());
      this.tlGen$5 = null
    }
  };
  return this.tlVal$5
});
$c_sci_Stream$Cons.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  if ($is_sci_Stream$Cons(that)) {
    var x2 = $as_sci_Stream$Cons(that);
    return this.consEq$1__p5__sci_Stream$Cons__sci_Stream$Cons__Z(this, x2)
  } else {
    return $f_sc_LinearSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
  }
});
$c_sci_Stream$Cons.prototype.isEmpty__Z = (function() {
  return false
});
$c_sci_Stream$Cons.prototype.tailDefined__Z = (function() {
  return (this.tlGen$5 === null)
});
$c_sci_Stream$Cons.prototype.consEq$1__p5__sci_Stream$Cons__sci_Stream$Cons__Z = (function(a, b) {
  _consEq: while (true) {
    if ($m_sr_BoxesRunTime$().equals__O__O__Z(a.hd$5, b.hd$5)) {
      var x1 = a.tail__sci_Stream();
      if ($is_sci_Stream$Cons(x1)) {
        var x2 = $as_sci_Stream$Cons(x1);
        var x1$2 = b.tail__sci_Stream();
        if ($is_sci_Stream$Cons(x1$2)) {
          var x2$2 = $as_sci_Stream$Cons(x1$2);
          if ((x2 === x2$2)) {
            return true
          } else {
            a = x2;
            b = x2$2;
            continue _consEq
          }
        } else {
          return false
        }
      } else {
        return b.tail__sci_Stream().isEmpty__Z()
      }
    } else {
      return false
    }
  }
});
$c_sci_Stream$Cons.prototype.tail__O = (function() {
  return this.tail__sci_Stream()
});
$c_sci_Stream$Cons.prototype.init___O__F0 = (function(hd, tl) {
  this.hd$5 = hd;
  this.tlGen$5 = tl;
  return this
});
function $is_sci_Stream$Cons(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Stream$Cons)))
}
function $as_sci_Stream$Cons(obj) {
  return (($is_sci_Stream$Cons(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Stream$Cons"))
}
function $isArrayOf_sci_Stream$Cons(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Stream$Cons)))
}
function $asArrayOf_sci_Stream$Cons(obj, depth) {
  return (($isArrayOf_sci_Stream$Cons(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Stream$Cons;", depth))
}
var $d_sci_Stream$Cons = new $TypeData().initClass({
  sci_Stream$Cons: 0
}, false, "scala.collection.immutable.Stream$Cons", {
  sci_Stream$Cons: 1,
  sci_Stream: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  sc_LinearSeqOptimized: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Stream$Cons.prototype.$classData = $d_sci_Stream$Cons;
/** @constructor */
function $c_sci_Stream$Empty$() {
  $c_sci_Stream.call(this)
}
$c_sci_Stream$Empty$.prototype = new $h_sci_Stream();
$c_sci_Stream$Empty$.prototype.constructor = $c_sci_Stream$Empty$;
/** @constructor */
function $h_sci_Stream$Empty$() {
  /*<skip>*/
}
$h_sci_Stream$Empty$.prototype = $c_sci_Stream$Empty$.prototype;
$c_sci_Stream$Empty$.prototype.head__O = (function() {
  this.head__sr_Nothing$()
});
$c_sci_Stream$Empty$.prototype.init___ = (function() {
  return this
});
$c_sci_Stream$Empty$.prototype.isEmpty__Z = (function() {
  return true
});
$c_sci_Stream$Empty$.prototype.tailDefined__Z = (function() {
  return false
});
$c_sci_Stream$Empty$.prototype.tail__sr_Nothing$ = (function() {
  throw new $c_jl_UnsupportedOperationException().init___T("tail of empty stream")
});
$c_sci_Stream$Empty$.prototype.head__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("head of empty stream")
});
$c_sci_Stream$Empty$.prototype.tail__O = (function() {
  this.tail__sr_Nothing$()
});
var $d_sci_Stream$Empty$ = new $TypeData().initClass({
  sci_Stream$Empty$: 0
}, false, "scala.collection.immutable.Stream$Empty$", {
  sci_Stream$Empty$: 1,
  sci_Stream: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  sc_LinearSeqOptimized: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Stream$Empty$.prototype.$classData = $d_sci_Stream$Empty$;
var $n_sci_Stream$Empty$ = (void 0);
function $m_sci_Stream$Empty$() {
  if ((!$n_sci_Stream$Empty$)) {
    $n_sci_Stream$Empty$ = new $c_sci_Stream$Empty$().init___()
  };
  return $n_sci_Stream$Empty$
}
/** @constructor */
function $c_sci_Vector() {
  $c_sc_AbstractSeq.call(this);
  this.startIndex$4 = 0;
  this.endIndex$4 = 0;
  this.focus$4 = 0;
  this.dirty$4 = false;
  this.depth$4 = 0;
  this.display0$4 = null;
  this.display1$4 = null;
  this.display2$4 = null;
  this.display3$4 = null;
  this.display4$4 = null;
  this.display5$4 = null
}
$c_sci_Vector.prototype = new $h_sc_AbstractSeq();
$c_sci_Vector.prototype.constructor = $c_sci_Vector;
/** @constructor */
function $h_sci_Vector() {
  /*<skip>*/
}
$h_sci_Vector.prototype = $c_sci_Vector.prototype;
$c_sci_Vector.prototype.checkRangeConvert__p4__I__I = (function(index) {
  var idx = ((index + this.startIndex$4) | 0);
  if (((index >= 0) && (idx < this.endIndex$4))) {
    return idx
  } else {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + index))
  }
});
$c_sci_Vector.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_Vector.prototype.display3__AO = (function() {
  return this.display3$4
});
$c_sci_Vector.prototype.gotoPosWritable__p4__I__I__I__V = (function(oldIndex, newIndex, xor) {
  if (this.dirty$4) {
    $f_sci_VectorPointer__gotoPosWritable1__I__I__I__V(this, oldIndex, newIndex, xor)
  } else {
    $f_sci_VectorPointer__gotoPosWritable0__I__I__V(this, newIndex, xor);
    this.dirty$4 = true
  }
});
$c_sci_Vector.prototype.apply__I__O = (function(index) {
  var idx = this.checkRangeConvert__p4__I__I(index);
  var xor = (idx ^ this.focus$4);
  return $f_sci_VectorPointer__getElem__I__I__O(this, idx, xor)
});
$c_sci_Vector.prototype.depth__I = (function() {
  return this.depth$4
});
$c_sci_Vector.prototype.lengthCompare__I__I = (function(len) {
  return ((this.length__I() - len) | 0)
});
$c_sci_Vector.prototype.apply__O__O = (function(v1) {
  return this.apply__I__O($uI(v1))
});
$c_sci_Vector.prototype.initIterator__sci_VectorIterator__V = (function(s) {
  var depth = this.depth$4;
  $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V(s, this, depth);
  if (this.dirty$4) {
    var index = this.focus$4;
    $f_sci_VectorPointer__stabilize__I__V(s, index)
  };
  if ((s.depth$2 > 1)) {
    var index$1 = this.startIndex$4;
    var xor = (this.startIndex$4 ^ this.focus$4);
    $f_sci_VectorPointer__gotoPos__I__I__V(s, index$1, xor)
  }
});
$c_sci_Vector.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_Vector.prototype.init___I__I__I = (function(startIndex, endIndex, focus) {
  this.startIndex$4 = startIndex;
  this.endIndex$4 = endIndex;
  this.focus$4 = focus;
  this.dirty$4 = false;
  return this
});
$c_sci_Vector.prototype.display5$und$eq__AO__V = (function(x$1) {
  this.display5$4 = x$1
});
$c_sci_Vector.prototype.$$colon$plus__O__scg_CanBuildFrom__O = (function(elem, bf) {
  return ((((bf === ($m_sci_IndexedSeq$(), $m_sc_IndexedSeq$().ReusableCBF$6)) || (bf === $m_sci_Seq$().ReusableCBFInstance$2)) || (bf === $m_sc_Seq$().ReusableCBFInstance$2)) ? this.appendBack__O__sci_Vector(elem) : $f_sc_SeqLike__$$colon$plus__O__scg_CanBuildFrom__O(this, elem, bf))
});
$c_sci_Vector.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_Vector$()
});
$c_sci_Vector.prototype.display0__AO = (function() {
  return this.display0$4
});
$c_sci_Vector.prototype.display4__AO = (function() {
  return this.display4$4
});
$c_sci_Vector.prototype.display2$und$eq__AO__V = (function(x$1) {
  this.display2$4 = x$1
});
$c_sci_Vector.prototype.shiftTopLevel__p4__I__I__V = (function(oldLeft, newLeft) {
  var x1 = (((-1) + this.depth$4) | 0);
  switch (x1) {
    case 0: {
      var array = this.display0$4;
      this.display0$4 = $f_sci_VectorPointer__copyRange__AO__I__I__AO(this, array, oldLeft, newLeft);
      break
    }
    case 1: {
      var array$1 = this.display1$4;
      this.display1$4 = $f_sci_VectorPointer__copyRange__AO__I__I__AO(this, array$1, oldLeft, newLeft);
      break
    }
    case 2: {
      var array$2 = this.display2$4;
      this.display2$4 = $f_sci_VectorPointer__copyRange__AO__I__I__AO(this, array$2, oldLeft, newLeft);
      break
    }
    case 3: {
      var array$3 = this.display3$4;
      this.display3$4 = $f_sci_VectorPointer__copyRange__AO__I__I__AO(this, array$3, oldLeft, newLeft);
      break
    }
    case 4: {
      var array$4 = this.display4$4;
      this.display4$4 = $f_sci_VectorPointer__copyRange__AO__I__I__AO(this, array$4, oldLeft, newLeft);
      break
    }
    case 5: {
      var array$5 = this.display5$4;
      this.display5$4 = $f_sci_VectorPointer__copyRange__AO__I__I__AO(this, array$5, oldLeft, newLeft);
      break
    }
    default: {
      throw new $c_s_MatchError().init___O(x1)
    }
  }
});
$c_sci_Vector.prototype.appendBack__O__sci_Vector = (function(value) {
  if ((this.endIndex$4 !== this.startIndex$4)) {
    var blockIndex = ((-32) & this.endIndex$4);
    var lo = (31 & this.endIndex$4);
    if ((this.endIndex$4 !== blockIndex)) {
      var s = new $c_sci_Vector().init___I__I__I(this.startIndex$4, ((1 + this.endIndex$4) | 0), blockIndex);
      var depth = this.depth$4;
      $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V(s, this, depth);
      s.dirty$4 = this.dirty$4;
      s.gotoPosWritable__p4__I__I__I__V(this.focus$4, blockIndex, (this.focus$4 ^ blockIndex));
      s.display0$4.set(lo, value);
      return s
    } else {
      var shift = (this.startIndex$4 & (~(((-1) + (1 << $imul(5, (((-1) + this.depth$4) | 0)))) | 0)));
      var shiftBlocks = ((this.startIndex$4 >>> $imul(5, (((-1) + this.depth$4) | 0))) | 0);
      if ((shift !== 0)) {
        $f_sci_VectorPointer__debug__V(this);
        if ((this.depth$4 > 1)) {
          var newBlockIndex = ((blockIndex - shift) | 0);
          var newFocus = ((this.focus$4 - shift) | 0);
          var s$2 = new $c_sci_Vector().init___I__I__I(((this.startIndex$4 - shift) | 0), ((((1 + this.endIndex$4) | 0) - shift) | 0), newBlockIndex);
          var depth$1 = this.depth$4;
          $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V(s$2, this, depth$1);
          s$2.dirty$4 = this.dirty$4;
          s$2.shiftTopLevel__p4__I__I__V(shiftBlocks, 0);
          $f_sci_VectorPointer__debug__V(s$2);
          s$2.gotoFreshPosWritable__p4__I__I__I__V(newFocus, newBlockIndex, (newFocus ^ newBlockIndex));
          s$2.display0$4.set(lo, value);
          $f_sci_VectorPointer__debug__V(s$2);
          return s$2
        } else {
          var newBlockIndex$2 = (((-32) + blockIndex) | 0);
          var newFocus$2 = this.focus$4;
          var s$3 = new $c_sci_Vector().init___I__I__I(((this.startIndex$4 - shift) | 0), ((((1 + this.endIndex$4) | 0) - shift) | 0), newBlockIndex$2);
          var depth$2 = this.depth$4;
          $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V(s$3, this, depth$2);
          s$3.dirty$4 = this.dirty$4;
          s$3.shiftTopLevel__p4__I__I__V(shiftBlocks, 0);
          s$3.gotoPosWritable__p4__I__I__I__V(newFocus$2, newBlockIndex$2, (newFocus$2 ^ newBlockIndex$2));
          s$3.display0$4.set(((32 - shift) | 0), value);
          $f_sci_VectorPointer__debug__V(s$3);
          return s$3
        }
      } else {
        var newFocus$3 = this.focus$4;
        var s$4 = new $c_sci_Vector().init___I__I__I(this.startIndex$4, ((1 + this.endIndex$4) | 0), blockIndex);
        var depth$3 = this.depth$4;
        $f_sci_VectorPointer__initFrom__sci_VectorPointer__I__V(s$4, this, depth$3);
        s$4.dirty$4 = this.dirty$4;
        s$4.gotoFreshPosWritable__p4__I__I__I__V(newFocus$3, blockIndex, (newFocus$3 ^ blockIndex));
        s$4.display0$4.set(lo, value);
        if ((s$4.depth$4 === ((1 + this.depth$4) | 0))) {
          $f_sci_VectorPointer__debug__V(s$4)
        };
        return s$4
      }
    }
  } else {
    var elems = $newArrayObject($d_O.getArrayOf(), [32]);
    elems.set(0, value);
    var s$5 = new $c_sci_Vector().init___I__I__I(0, 1, 0);
    s$5.depth$4 = 1;
    s$5.display0$4 = elems;
    return s$5
  }
});
$c_sci_Vector.prototype.iterator__sc_Iterator = (function() {
  return this.iterator__sci_VectorIterator()
});
$c_sci_Vector.prototype.display1$und$eq__AO__V = (function(x$1) {
  this.display1$4 = x$1
});
$c_sci_Vector.prototype.length__I = (function() {
  return ((this.endIndex$4 - this.startIndex$4) | 0)
});
$c_sci_Vector.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sci_Vector.prototype.display4$und$eq__AO__V = (function(x$1) {
  this.display4$4 = x$1
});
$c_sci_Vector.prototype.gotoFreshPosWritable__p4__I__I__I__V = (function(oldIndex, newIndex, xor) {
  if (this.dirty$4) {
    $f_sci_VectorPointer__gotoFreshPosWritable1__I__I__I__V(this, oldIndex, newIndex, xor)
  } else {
    $f_sci_VectorPointer__gotoFreshPosWritable0__I__I__I__V(this, oldIndex, newIndex, xor);
    this.dirty$4 = true
  }
});
$c_sci_Vector.prototype.sizeHintIfCheap__I = (function() {
  return this.length__I()
});
$c_sci_Vector.prototype.display1__AO = (function() {
  return this.display1$4
});
$c_sci_Vector.prototype.display5__AO = (function() {
  return this.display5$4
});
$c_sci_Vector.prototype.thisCollection__sc_Seq = (function() {
  return this
});
$c_sci_Vector.prototype.iterator__sci_VectorIterator = (function() {
  var s = new $c_sci_VectorIterator().init___I__I(this.startIndex$4, this.endIndex$4);
  this.initIterator__sci_VectorIterator__V(s);
  return s
});
$c_sci_Vector.prototype.isDefinedAt__O__Z = (function(x) {
  var idx = $uI(x);
  return $f_sc_GenSeqLike__isDefinedAt__I__Z(this, idx)
});
$c_sci_Vector.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sci_Vector.prototype.depth$und$eq__I__V = (function(x$1) {
  this.depth$4 = x$1
});
$c_sci_Vector.prototype.display2__AO = (function() {
  return this.display2$4
});
$c_sci_Vector.prototype.display0$und$eq__AO__V = (function(x$1) {
  this.display0$4 = x$1
});
$c_sci_Vector.prototype.display3$und$eq__AO__V = (function(x$1) {
  this.display3$4 = x$1
});
function $is_sci_Vector(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Vector)))
}
function $as_sci_Vector(obj) {
  return (($is_sci_Vector(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.immutable.Vector"))
}
function $isArrayOf_sci_Vector(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Vector)))
}
function $asArrayOf_sci_Vector(obj, depth) {
  return (($isArrayOf_sci_Vector(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.immutable.Vector;", depth))
}
var $d_sci_Vector = new $TypeData().initClass({
  sci_Vector: 0
}, false, "scala.collection.immutable.Vector", {
  sci_Vector: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_IndexedSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  sci_VectorPointer: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
$c_sci_Vector.prototype.$classData = $d_sci_Vector;
/** @constructor */
function $c_sci_WrappedString() {
  $c_sc_AbstractSeq.call(this);
  this.self$4 = null
}
$c_sci_WrappedString.prototype = new $h_sc_AbstractSeq();
$c_sci_WrappedString.prototype.constructor = $c_sci_WrappedString;
/** @constructor */
function $h_sci_WrappedString() {
  /*<skip>*/
}
$h_sci_WrappedString.prototype = $c_sci_WrappedString.prototype;
$c_sci_WrappedString.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sci_WrappedString.prototype.apply__I__O = (function(idx) {
  var thiz = this.self$4;
  var c = (65535 & $uI(thiz.charCodeAt(idx)));
  return new $c_jl_Character().init___C(c)
});
$c_sci_WrappedString.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_sci_WrappedString.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_sci_WrappedString.prototype.apply__O__O = (function(v1) {
  var n = $uI(v1);
  var thiz = this.self$4;
  var c = (65535 & $uI(thiz.charCodeAt(n)));
  return new $c_jl_Character().init___C(c)
});
$c_sci_WrappedString.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_sci_WrappedString.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sci_WrappedString.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sci_IndexedSeq$()
});
$c_sci_WrappedString.prototype.toString__T = (function() {
  return this.self$4
});
$c_sci_WrappedString.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_sci_WrappedString.prototype.iterator__sc_Iterator = (function() {
  var thiz = this.self$4;
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $uI(thiz.length))
});
$c_sci_WrappedString.prototype.length__I = (function() {
  var thiz = this.self$4;
  return $uI(thiz.length)
});
$c_sci_WrappedString.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sci_WrappedString.prototype.sizeHintIfCheap__I = (function() {
  var thiz = this.self$4;
  return $uI(thiz.length)
});
$c_sci_WrappedString.prototype.thisCollection__sc_Seq = (function() {
  return this
});
$c_sci_WrappedString.prototype.isDefinedAt__O__Z = (function(x) {
  var idx = $uI(x);
  return $f_sc_GenSeqLike__isDefinedAt__I__Z(this, idx)
});
$c_sci_WrappedString.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sci_WrappedString.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_sc_IndexedSeqOptimized__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_sci_WrappedString.prototype.init___T = (function(self) {
  this.self$4 = self;
  return this
});
$c_sci_WrappedString.prototype.newBuilder__scm_Builder = (function() {
  return $m_sci_WrappedString$().newBuilder__scm_Builder()
});
var $d_sci_WrappedString = new $TypeData().initClass({
  sci_WrappedString: 0
}, false, "scala.collection.immutable.WrappedString", {
  sci_WrappedString: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_IndexedSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  sci_StringLike: 1,
  sc_IndexedSeqOptimized: 1,
  s_math_Ordered: 1,
  jl_Comparable: 1
});
$c_sci_WrappedString.prototype.$classData = $d_sci_WrappedString;
/** @constructor */
function $c_sci_$colon$colon() {
  $c_sci_List.call(this);
  this.head$5 = null;
  this.tl$5 = null
}
$c_sci_$colon$colon.prototype = new $h_sci_List();
$c_sci_$colon$colon.prototype.constructor = $c_sci_$colon$colon;
/** @constructor */
function $h_sci_$colon$colon() {
  /*<skip>*/
}
$h_sci_$colon$colon.prototype = $c_sci_$colon$colon.prototype;
$c_sci_$colon$colon.prototype.head__O = (function() {
  return this.head$5
});
$c_sci_$colon$colon.prototype.productPrefix__T = (function() {
  return "::"
});
$c_sci_$colon$colon.prototype.productArity__I = (function() {
  return 2
});
$c_sci_$colon$colon.prototype.tail__sci_List = (function() {
  return this.tl$5
});
$c_sci_$colon$colon.prototype.isEmpty__Z = (function() {
  return false
});
$c_sci_$colon$colon.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0: {
      return this.head$5;
      break
    }
    case 1: {
      return this.tl$5;
      break
    }
    default: {
      throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
    }
  }
});
$c_sci_$colon$colon.prototype.tail__O = (function() {
  return this.tl$5
});
$c_sci_$colon$colon.prototype.init___O__sci_List = (function(head, tl) {
  this.head$5 = head;
  this.tl$5 = tl;
  return this
});
$c_sci_$colon$colon.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_sci_$colon$colon = new $TypeData().initClass({
  sci_$colon$colon: 0
}, false, "scala.collection.immutable.$colon$colon", {
  sci_$colon$colon: 1,
  sci_List: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  s_Product: 1,
  sc_LinearSeqOptimized: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_$colon$colon.prototype.$classData = $d_sci_$colon$colon;
/** @constructor */
function $c_sci_Nil$() {
  $c_sci_List.call(this)
}
$c_sci_Nil$.prototype = new $h_sci_List();
$c_sci_Nil$.prototype.constructor = $c_sci_Nil$;
/** @constructor */
function $h_sci_Nil$() {
  /*<skip>*/
}
$h_sci_Nil$.prototype = $c_sci_Nil$.prototype;
$c_sci_Nil$.prototype.productPrefix__T = (function() {
  return "Nil"
});
$c_sci_Nil$.prototype.head__O = (function() {
  this.head__sr_Nothing$()
});
$c_sci_Nil$.prototype.init___ = (function() {
  return this
});
$c_sci_Nil$.prototype.productArity__I = (function() {
  return 0
});
$c_sci_Nil$.prototype.isEmpty__Z = (function() {
  return true
});
$c_sci_Nil$.prototype.tail__sci_List = (function() {
  throw new $c_jl_UnsupportedOperationException().init___T("tail of empty list")
});
$c_sci_Nil$.prototype.equals__O__Z = (function(that) {
  if ($is_sc_GenSeq(that)) {
    var x2 = $as_sc_GenSeq(that);
    return x2.isEmpty__Z()
  } else {
    return false
  }
});
$c_sci_Nil$.prototype.productElement__I__O = (function(x$1) {
  throw new $c_jl_IndexOutOfBoundsException().init___T(("" + x$1))
});
$c_sci_Nil$.prototype.head__sr_Nothing$ = (function() {
  throw new $c_ju_NoSuchElementException().init___T("head of empty list")
});
$c_sci_Nil$.prototype.tail__O = (function() {
  return this.tail__sci_List()
});
$c_sci_Nil$.prototype.productIterator__sc_Iterator = (function() {
  return new $c_sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
var $d_sci_Nil$ = new $TypeData().initClass({
  sci_Nil$: 0
}, false, "scala.collection.immutable.Nil$", {
  sci_Nil$: 1,
  sci_List: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  s_Product: 1,
  sc_LinearSeqOptimized: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_sci_Nil$.prototype.$classData = $d_sci_Nil$;
var $n_sci_Nil$ = (void 0);
function $m_sci_Nil$() {
  if ((!$n_sci_Nil$)) {
    $n_sci_Nil$ = new $c_sci_Nil$().init___()
  };
  return $n_sci_Nil$
}
/** @constructor */
function $c_scm_AbstractBuffer() {
  $c_scm_AbstractSeq.call(this)
}
$c_scm_AbstractBuffer.prototype = new $h_scm_AbstractSeq();
$c_scm_AbstractBuffer.prototype.constructor = $c_scm_AbstractBuffer;
/** @constructor */
function $h_scm_AbstractBuffer() {
  /*<skip>*/
}
$h_scm_AbstractBuffer.prototype = $c_scm_AbstractBuffer.prototype;
$c_scm_AbstractBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
});
/** @constructor */
function $c_scm_ListBuffer() {
  $c_scm_AbstractBuffer.call(this);
  this.scala$collection$mutable$ListBuffer$$start$6 = null;
  this.last0$6 = null;
  this.exported$6 = false;
  this.len$6 = 0
}
$c_scm_ListBuffer.prototype = new $h_scm_AbstractBuffer();
$c_scm_ListBuffer.prototype.constructor = $c_scm_ListBuffer;
/** @constructor */
function $h_scm_ListBuffer() {
  /*<skip>*/
}
$h_scm_ListBuffer.prototype = $c_scm_ListBuffer.prototype;
$c_scm_ListBuffer.prototype.copy__p6__V = (function() {
  if (this.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z()) {
    return (void 0)
  };
  var cursor = this.scala$collection$mutable$ListBuffer$$start$6;
  var this$1 = this.last0$6;
  var limit = this$1.tl$5;
  this.clear__V();
  while ((cursor !== limit)) {
    this.$$plus$eq__O__scm_ListBuffer(cursor.head__O());
    var this$2 = cursor;
    cursor = this$2.tail__sci_List()
  }
});
$c_scm_ListBuffer.prototype.init___ = (function() {
  this.scala$collection$mutable$ListBuffer$$start$6 = $m_sci_Nil$();
  this.exported$6 = false;
  this.len$6 = 0;
  return this
});
$c_scm_ListBuffer.prototype.apply__I__O = (function(n) {
  if (((n < 0) || (n >= this.len$6))) {
    throw new $c_jl_IndexOutOfBoundsException().init___T(("" + n))
  } else {
    var this$2 = this.scala$collection$mutable$ListBuffer$$start$6;
    return $f_sc_LinearSeqOptimized__apply__I__O(this$2, n)
  }
});
$c_scm_ListBuffer.prototype.lengthCompare__I__I = (function(len) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_LinearSeqOptimized__lengthCompare__I__I(this$1, len)
});
$c_scm_ListBuffer.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_LinearSeqOptimized__sameElements__sc_GenIterable__Z(this$1, that)
});
$c_scm_ListBuffer.prototype.apply__O__O = (function(v1) {
  return this.apply__I__O($uI(v1))
});
$c_scm_ListBuffer.prototype.isEmpty__Z = (function() {
  return this.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z()
});
$c_scm_ListBuffer.prototype.toList__sci_List = (function() {
  this.exported$6 = (!this.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z());
  return this.scala$collection$mutable$ListBuffer$$start$6
});
$c_scm_ListBuffer.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_scm_ListBuffer.prototype.equals__O__Z = (function(that) {
  if ($is_scm_ListBuffer(that)) {
    var x2 = $as_scm_ListBuffer(that);
    return this.scala$collection$mutable$ListBuffer$$start$6.equals__O__Z(x2.scala$collection$mutable$ListBuffer$$start$6)
  } else {
    return $f_sc_GenSeqLike__equals__O__Z(this, that)
  }
});
$c_scm_ListBuffer.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_TraversableOnce__mkString__T__T__T__T(this$1, start, sep, end)
});
$c_scm_ListBuffer.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_ListBuffer(elem)
});
$c_scm_ListBuffer.prototype.companion__scg_GenericCompanion = (function() {
  return $m_scm_ListBuffer$()
});
$c_scm_ListBuffer.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  var these = this$1;
  while ((!these.isEmpty__Z())) {
    f.apply__O__O(these.head__O());
    var this$2 = these;
    these = this$2.tail__sci_List()
  }
});
$c_scm_ListBuffer.prototype.result__O = (function() {
  return this.toList__sci_List()
});
$c_scm_ListBuffer.prototype.iterator__sc_Iterator = (function() {
  return new $c_scm_ListBuffer$$anon$1().init___scm_ListBuffer(this)
});
$c_scm_ListBuffer.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_ListBuffer.prototype.length__I = (function() {
  return this.len$6
});
$c_scm_ListBuffer.prototype.seq__sc_Seq = (function() {
  return this
});
$c_scm_ListBuffer.prototype.toStream__sci_Stream = (function() {
  return this.scala$collection$mutable$ListBuffer$$start$6.toStream__sci_Stream()
});
$c_scm_ListBuffer.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_TraversableOnce__addString__scm_StringBuilder__T__T__T__scm_StringBuilder(this$1, b, start, sep, end)
});
$c_scm_ListBuffer.prototype.$$plus$eq__O__scm_ListBuffer = (function(x) {
  if (this.exported$6) {
    this.copy__p6__V()
  };
  if (this.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z()) {
    this.last0$6 = new $c_sci_$colon$colon().init___O__sci_List(x, $m_sci_Nil$());
    this.scala$collection$mutable$ListBuffer$$start$6 = this.last0$6
  } else {
    var last1 = this.last0$6;
    this.last0$6 = new $c_sci_$colon$colon().init___O__sci_List(x, $m_sci_Nil$());
    last1.tl$5 = this.last0$6
  };
  this.len$6 = ((1 + this.len$6) | 0);
  return this
});
$c_scm_ListBuffer.prototype.isDefinedAt__O__Z = (function(x) {
  var x$1 = $uI(x);
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return $f_sc_LinearSeqOptimized__isDefinedAt__I__Z(this$1, x$1)
});
$c_scm_ListBuffer.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_ListBuffer(elem)
});
$c_scm_ListBuffer.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_ListBuffer.prototype.clear__V = (function() {
  this.scala$collection$mutable$ListBuffer$$start$6 = $m_sci_Nil$();
  this.last0$6 = null;
  this.exported$6 = false;
  this.len$6 = 0
});
$c_scm_ListBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_ListBuffer = (function(xs) {
  _$plus$plus$eq: while (true) {
    var x1 = xs;
    if ((x1 !== null)) {
      if ((x1 === this)) {
        var n = this.len$6;
        xs = $as_sc_TraversableOnce($f_sc_IterableLike__take__I__O(this, n));
        continue _$plus$plus$eq
      }
    };
    return $as_scm_ListBuffer($f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs))
  }
});
$c_scm_ListBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_ListBuffer(xs)
});
$c_scm_ListBuffer.prototype.stringPrefix__T = (function() {
  return "ListBuffer"
});
function $is_scm_ListBuffer(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ListBuffer)))
}
function $as_scm_ListBuffer(obj) {
  return (($is_scm_ListBuffer(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ListBuffer"))
}
function $isArrayOf_scm_ListBuffer(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ListBuffer)))
}
function $asArrayOf_scm_ListBuffer(obj, depth) {
  return (($isArrayOf_scm_ListBuffer(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ListBuffer;", depth))
}
var $d_scm_ListBuffer = new $TypeData().initClass({
  scm_ListBuffer: 0
}, false, "scala.collection.mutable.ListBuffer", {
  scm_ListBuffer: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_BufferLike: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  sc_script_Scriptable: 1,
  scg_Subtractable: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_SeqForwarder: 1,
  scg_IterableForwarder: 1,
  scg_TraversableForwarder: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ListBuffer.prototype.$classData = $d_scm_ListBuffer;
/** @constructor */
function $c_scm_StringBuilder() {
  $c_scm_AbstractSeq.call(this);
  this.underlying$5 = null
}
$c_scm_StringBuilder.prototype = new $h_scm_AbstractSeq();
$c_scm_StringBuilder.prototype.constructor = $c_scm_StringBuilder;
/** @constructor */
function $h_scm_StringBuilder() {
  /*<skip>*/
}
$h_scm_StringBuilder.prototype = $c_scm_StringBuilder.prototype;
$c_scm_StringBuilder.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_scm_StringBuilder.prototype.init___ = (function() {
  $c_scm_StringBuilder.prototype.init___I__T.call(this, 16, "");
  return this
});
$c_scm_StringBuilder.prototype.$$plus$eq__C__scm_StringBuilder = (function(x) {
  this.append__C__scm_StringBuilder(x);
  return this
});
$c_scm_StringBuilder.prototype.apply__I__O = (function(idx) {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  var c = (65535 & $uI(thiz.charCodeAt(idx)));
  return new $c_jl_Character().init___C(c)
});
$c_scm_StringBuilder.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_scm_StringBuilder.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  var c = (65535 & $uI(thiz.charCodeAt(index)));
  return new $c_jl_Character().init___C(c)
});
$c_scm_StringBuilder.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_scm_StringBuilder.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_scm_StringBuilder.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_scm_StringBuilder.prototype.subSequence__I__I__jl_CharSequence = (function(start, end) {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  return $as_T(thiz.substring(start, end))
});
$c_scm_StringBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  if ((elem === null)) {
    var jsx$1 = 0
  } else {
    var this$2 = $as_jl_Character(elem);
    var jsx$1 = this$2.value$1
  };
  return this.$$plus$eq__C__scm_StringBuilder(jsx$1)
});
$c_scm_StringBuilder.prototype.toString__T = (function() {
  var this$1 = this.underlying$5;
  return this$1.content$1
});
$c_scm_StringBuilder.prototype.companion__scg_GenericCompanion = (function() {
  return $m_scm_IndexedSeq$()
});
$c_scm_StringBuilder.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_scm_StringBuilder.prototype.result__O = (function() {
  var this$1 = this.underlying$5;
  return this$1.content$1
});
$c_scm_StringBuilder.prototype.append__T__scm_StringBuilder = (function(s) {
  this.underlying$5.append__T__jl_StringBuilder(s);
  return this
});
$c_scm_StringBuilder.prototype.iterator__sc_Iterator = (function() {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $uI(thiz.length))
});
$c_scm_StringBuilder.prototype.seq__scm_Seq = (function() {
  return this
});
$c_scm_StringBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_StringBuilder.prototype.init___I__T = (function(initCapacity, initValue) {
  $c_scm_StringBuilder.prototype.init___jl_StringBuilder.call(this, new $c_jl_StringBuilder().init___I((($uI(initValue.length) + initCapacity) | 0)).append__T__jl_StringBuilder(initValue));
  return this
});
$c_scm_StringBuilder.prototype.length__I = (function() {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  return $uI(thiz.length)
});
$c_scm_StringBuilder.prototype.seq__sc_Seq = (function() {
  return this
});
$c_scm_StringBuilder.prototype.sizeHintIfCheap__I = (function() {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  return $uI(thiz.length)
});
$c_scm_StringBuilder.prototype.thisCollection__sc_Seq = (function() {
  return this
});
$c_scm_StringBuilder.prototype.init___jl_StringBuilder = (function(underlying) {
  this.underlying$5 = underlying;
  return this
});
$c_scm_StringBuilder.prototype.append__O__scm_StringBuilder = (function(x) {
  this.underlying$5.append__T__jl_StringBuilder($m_sjsr_RuntimeString$().valueOf__O__T(x));
  return this
});
$c_scm_StringBuilder.prototype.isDefinedAt__O__Z = (function(x) {
  var idx = $uI(x);
  return $f_sc_GenSeqLike__isDefinedAt__I__Z(this, idx)
});
$c_scm_StringBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  if ((elem === null)) {
    var jsx$1 = 0
  } else {
    var this$2 = $as_jl_Character(elem);
    var jsx$1 = this$2.value$1
  };
  return this.$$plus$eq__C__scm_StringBuilder(jsx$1)
});
$c_scm_StringBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_scm_StringBuilder.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_sc_IndexedSeqOptimized__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_scm_StringBuilder.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_scm_StringBuilder.prototype.append__C__scm_StringBuilder = (function(x) {
  this.underlying$5.append__C__jl_StringBuilder(x);
  return this
});
$c_scm_StringBuilder.prototype.newBuilder__scm_Builder = (function() {
  return new $c_scm_GrowingBuilder().init___scg_Growable(new $c_scm_StringBuilder().init___())
});
$c_scm_StringBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return $f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs)
});
var $d_scm_StringBuilder = new $TypeData().initClass({
  scm_StringBuilder: 0
}, false, "scala.collection.mutable.StringBuilder", {
  scm_StringBuilder: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  jl_CharSequence: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  sci_StringLike: 1,
  sc_IndexedSeqOptimized: 1,
  s_math_Ordered: 1,
  jl_Comparable: 1,
  scm_ReusableBuilder: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_StringBuilder.prototype.$classData = $d_scm_StringBuilder;
/** @constructor */
function $c_sjs_js_WrappedArray() {
  $c_scm_AbstractBuffer.call(this);
  this.array$6 = null
}
$c_sjs_js_WrappedArray.prototype = new $h_scm_AbstractBuffer();
$c_sjs_js_WrappedArray.prototype.constructor = $c_sjs_js_WrappedArray;
/** @constructor */
function $h_sjs_js_WrappedArray() {
  /*<skip>*/
}
$h_sjs_js_WrappedArray.prototype = $c_sjs_js_WrappedArray.prototype;
$c_sjs_js_WrappedArray.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.init___ = (function() {
  $c_sjs_js_WrappedArray.prototype.init___sjs_js_Array.call(this, []);
  return this
});
$c_sjs_js_WrappedArray.prototype.apply__I__O = (function(index) {
  return this.array$6[index]
});
$c_sjs_js_WrappedArray.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_sjs_js_WrappedArray.prototype.apply__O__O = (function(v1) {
  var index = $uI(v1);
  return this.array$6[index]
});
$c_sjs_js_WrappedArray.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_sjs_js_WrappedArray.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_sjs_js_WrappedArray.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  this.array$6.push(elem);
  return this
});
$c_sjs_js_WrappedArray.prototype.companion__scg_GenericCompanion = (function() {
  return $m_sjs_js_WrappedArray$()
});
$c_sjs_js_WrappedArray.prototype.foreach__F1__V = (function(f) {
  $f_sc_IndexedSeqOptimized__foreach__F1__V(this, f)
});
$c_sjs_js_WrappedArray.prototype.result__O = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.seq__scm_Seq = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, $uI(this.array$6.length))
});
$c_sjs_js_WrappedArray.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_sjs_js_WrappedArray.prototype.seq__sc_Seq = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.length__I = (function() {
  return $uI(this.array$6.length)
});
$c_sjs_js_WrappedArray.prototype.sizeHintIfCheap__I = (function() {
  return $uI(this.array$6.length)
});
$c_sjs_js_WrappedArray.prototype.thisCollection__sc_Seq = (function() {
  return this
});
$c_sjs_js_WrappedArray.prototype.isDefinedAt__O__Z = (function(x) {
  var idx = $uI(x);
  return $f_sc_GenSeqLike__isDefinedAt__I__Z(this, idx)
});
$c_sjs_js_WrappedArray.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  this.array$6.push(elem);
  return this
});
$c_sjs_js_WrappedArray.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_sjs_js_WrappedArray.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
$c_sjs_js_WrappedArray.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_sc_IndexedSeqOptimized__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_sjs_js_WrappedArray.prototype.init___sjs_js_Array = (function(array) {
  this.array$6 = array;
  return this
});
$c_sjs_js_WrappedArray.prototype.stringPrefix__T = (function() {
  return "WrappedArray"
});
var $d_sjs_js_WrappedArray = new $TypeData().initClass({
  sjs_js_WrappedArray: 0
}, false, "scala.scalajs.js.WrappedArray", {
  sjs_js_WrappedArray: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_BufferLike: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  sc_script_Scriptable: 1,
  scg_Subtractable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  scm_Builder: 1
});
$c_sjs_js_WrappedArray.prototype.$classData = $d_sjs_js_WrappedArray;
/** @constructor */
function $c_scm_ArrayBuffer() {
  $c_scm_AbstractBuffer.call(this);
  this.initialSize$6 = 0;
  this.array$6 = null;
  this.size0$6 = 0
}
$c_scm_ArrayBuffer.prototype = new $h_scm_AbstractBuffer();
$c_scm_ArrayBuffer.prototype.constructor = $c_scm_ArrayBuffer;
/** @constructor */
function $h_scm_ArrayBuffer() {
  /*<skip>*/
}
$h_scm_ArrayBuffer.prototype = $c_scm_ArrayBuffer.prototype;
$c_scm_ArrayBuffer.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.$$plus$eq__O__scm_ArrayBuffer = (function(elem) {
  var n = ((1 + this.size0$6) | 0);
  $f_scm_ResizableArray__ensureSize__I__V(this, n);
  this.array$6.set(this.size0$6, elem);
  this.size0$6 = ((1 + this.size0$6) | 0);
  return this
});
$c_scm_ArrayBuffer.prototype.init___ = (function() {
  $c_scm_ArrayBuffer.prototype.init___I.call(this, 16);
  return this
});
$c_scm_ArrayBuffer.prototype.apply__I__O = (function(idx) {
  return $f_scm_ResizableArray__apply__I__O(this, idx)
});
$c_scm_ArrayBuffer.prototype.lengthCompare__I__I = (function(len) {
  return $f_sc_IndexedSeqOptimized__lengthCompare__I__I(this, len)
});
$c_scm_ArrayBuffer.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return $f_sc_IndexedSeqOptimized__sameElements__sc_GenIterable__Z(this, that)
});
$c_scm_ArrayBuffer.prototype.apply__O__O = (function(v1) {
  var idx = $uI(v1);
  return $f_scm_ResizableArray__apply__I__O(this, idx)
});
$c_scm_ArrayBuffer.prototype.isEmpty__Z = (function() {
  return $f_sc_IndexedSeqOptimized__isEmpty__Z(this)
});
$c_scm_ArrayBuffer.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_ArrayBuffer(elem)
});
$c_scm_ArrayBuffer.prototype.companion__scg_GenericCompanion = (function() {
  return $m_scm_ArrayBuffer$()
});
$c_scm_ArrayBuffer.prototype.foreach__F1__V = (function(f) {
  $f_scm_ResizableArray__foreach__F1__V(this, f)
});
$c_scm_ArrayBuffer.prototype.result__O = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.iterator__sc_Iterator = (function() {
  return new $c_sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, this.size0$6)
});
$c_scm_ArrayBuffer.prototype.seq__scm_Seq = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  $f_scm_Builder__sizeHintBounded__I__sc_TraversableLike__V(this, size, boundingColl)
});
$c_scm_ArrayBuffer.prototype.init___I = (function(initialSize) {
  this.initialSize$6 = initialSize;
  $f_scm_ResizableArray__$$init$__V(this);
  return this
});
$c_scm_ArrayBuffer.prototype.length__I = (function() {
  return this.size0$6
});
$c_scm_ArrayBuffer.prototype.seq__sc_Seq = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.sizeHintIfCheap__I = (function() {
  return this.size0$6
});
$c_scm_ArrayBuffer.prototype.thisCollection__sc_Seq = (function() {
  return this
});
$c_scm_ArrayBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuffer = (function(xs) {
  if ($is_sc_IndexedSeqLike(xs)) {
    var x2 = $as_sc_IndexedSeqLike(xs);
    var n = x2.length__I();
    var n$1 = ((this.size0$6 + n) | 0);
    $f_scm_ResizableArray__ensureSize__I__V(this, n$1);
    x2.copyToArray__O__I__I__V(this.array$6, this.size0$6, n);
    this.size0$6 = ((this.size0$6 + n) | 0);
    return this
  } else {
    return $as_scm_ArrayBuffer($f_scg_Growable__$$plus$plus$eq__sc_TraversableOnce__scg_Growable(this, xs))
  }
});
$c_scm_ArrayBuffer.prototype.isDefinedAt__O__Z = (function(x) {
  var idx = $uI(x);
  return $f_sc_GenSeqLike__isDefinedAt__I__Z(this, idx)
});
$c_scm_ArrayBuffer.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_ArrayBuffer(elem)
});
$c_scm_ArrayBuffer.prototype.sizeHint__I__V = (function(len) {
  if (((len > this.size0$6) && (len >= 1))) {
    var newarray = $newArrayObject($d_O.getArrayOf(), [len]);
    $systemArraycopy(this.array$6, 0, newarray, 0, this.size0$6);
    this.array$6 = newarray
  }
});
$c_scm_ArrayBuffer.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  $f_scm_ResizableArray__copyToArray__O__I__I__V(this, xs, start, len)
});
$c_scm_ArrayBuffer.prototype.hashCode__I = (function() {
  return $m_s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
$c_scm_ArrayBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuffer(xs)
});
$c_scm_ArrayBuffer.prototype.stringPrefix__T = (function() {
  return "ArrayBuffer"
});
function $is_scm_ArrayBuffer(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayBuffer)))
}
function $as_scm_ArrayBuffer(obj) {
  return (($is_scm_ArrayBuffer(obj) || (obj === null)) ? obj : $throwClassCastException(obj, "scala.collection.mutable.ArrayBuffer"))
}
function $isArrayOf_scm_ArrayBuffer(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayBuffer)))
}
function $asArrayOf_scm_ArrayBuffer(obj, depth) {
  return (($isArrayOf_scm_ArrayBuffer(obj, depth) || (obj === null)) ? obj : $throwArrayCastException(obj, "Lscala.collection.mutable.ArrayBuffer;", depth))
}
var $d_scm_ArrayBuffer = new $TypeData().initClass({
  scm_ArrayBuffer: 0
}, false, "scala.collection.mutable.ArrayBuffer", {
  scm_ArrayBuffer: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_BufferLike: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  sc_script_Scriptable: 1,
  scg_Subtractable: 1,
  scm_IndexedSeqOptimized: 1,
  scm_IndexedSeqLike: 1,
  sc_IndexedSeqLike: 1,
  sc_IndexedSeqOptimized: 1,
  scm_Builder: 1,
  scm_ResizableArray: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
$c_scm_ArrayBuffer.prototype.$classData = $d_scm_ArrayBuffer;
$e.com = ($e.com || {});
$e.com.ouspark = ($e.com.ouspark || {});
$e.com.ouspark.dashboard = ($e.com.ouspark.dashboard || {});
$e.com.ouspark.dashboard.DashApp = $m_Lcom_ouspark_dashboard_DashApp$;
}).call(this);
//# sourceMappingURL=scalajs-react-template-opt.js.map
