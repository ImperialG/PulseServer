#!/bin/sh

Pwdd=`pwd`;
#### UPDATE NDK path, if your NDK is not in the thirdparty folder
# requires NDK version r10e !!
NDKPATH="$Pwdd/../thirdparty/android-ndk";
STL_VERSION=4.8;

# Set to "yes" to build a fully static binary (with libstdc++)
# NOTE: The static binary does not have access to the android logger!
# A dynamic build against the logger is required in this case
STATIC_BIN="yes";

if [ "$STATIC_BIN" = "yes" ]; then
  STATIC_DEFINE="-D__STATIC_LINK";
  DYN_LIBS="-lgnustl_static";
  ENABLE_SHARED="no";
else
  DYN_LIBS="-llog -lgnustl_shared";
  ENABLE_SHARED="yes";
  STATIC_DEFINE="";
fi

#### build
./autogen.sh ;
./autogen.sh ;
platform=android-21
export CROSS_COMPILE=arm-linux-androideabi
export NDK="$NDKPATH"
export NDK_TOOLCHAIN="${NDK}/toolchains/${CROSS_COMPILE}-4.9/prebuilt/linux-x86_64/bin"
if [ ! -e "$NDK_TOOLCHAIN" ]; then
  export NDK_TOOLCHAIN="${NDK}/toolchains/${CROSS_COMPILE}-4.9/prebuilt/linux-x86_64/bin"
fi
export CC=${NDK_TOOLCHAIN}/${CROSS_COMPILE}-gcc
export CXX=${NDK_TOOLCHAIN}/${CROSS_COMPILE}-g++
export LD=${NDK_TOOLCHAIN}/${CROSS_COMPILE}-ld
export AR=${NDK_TOOLCHAIN}/${CROSS_COMPILE}-ar
export RANLIB=${NDK_TOOLCHAIN}/${CROSS_COMPILE}-ranlib
export STRIP=${NDK_TOOLCHAIN}/${CROSS_COMPILE}-strip
export ac_cv_func_malloc_0_nonnull=yes
export ac_cv_func_realloc_0_nonnull=yes

##flags
OPTIMISE="-fPIE -pie -ffast-math -ftree-vectorize -march=armv7-a -mthumb -mfloat-abi=softfp -mfpu=vfp -mfpu=neon -funsafe-math-optimizations";

DEFINES="-D__ANDROID__ -DOPENSMILE_BUILD -DBUILD_LIBSVM -DBUILD_SVMSMO -DBUILD_WITHOUT_EXPERIMENTAL $STATIC_DEFINE"

export LDFLAGS="-fPIE -pie -fexceptions -Wl,-rpath-link=${NDK}/platforms/${platform}/arch-arm/usr/lib -L${NDK}/platforms/${platform}/arch-arm/usr/lib -L${NDK}/sources/cxx-stl/gnu-libstdc++/${STL_VERSION}/libs/armeabi"
export SYSROOT=${NDK}/platforms/${platform}/arch-arm
export CXXFLAGS="-I${NDK}/platforms/${platform}/arch-arm/usr/include -I${NDK}/sources/cxx-stl/gnu-libstdc++/${STL_VERSION}/include -I${NDK}/sources/cxx-stl/gnu-libstdc++/${STL_VERSION}/libs/armeabi/include --sysroot=${SYSROOT} -O3 $OPTIMISE"
export CPPFLAGS="--sysroot=${SYSROOT} $DEFINES"
export CFLAGS="--sysroot=${SYSROOT} -nostdlib -O3 $DEFINES"
LIBS="-lc -lm -lgcc -lsupc++ $DYN_LIBS"

##configure opensmile
mkdir -p "$Pwdd/inst/android"
./configure --enable-static --enable-shared=${ENABLE_SHARED} --host=arm-linux-androideabi --target=arm-linux-androideabi LIBS="$LIBS" --prefix="$Pwdd/inst/android";
if [ $? != 0 ]; then
	echo "failed to configure openSMILE!";
	exit -1;
fi

make clean &&
make -j8 ;
make
if [ $? != 0 ]; then
	echo "failed to build openSMILE!";
	#exit -1;
fi

# fully static binary:
if [ "$STATIC_BIN" = "yes" ]; then
  rm -f SMILExtract
  mkdir -p "$Pwdd/inst/android/bin"
  echo $CXX $CXXFLAGS -o $Pwdd/inst/android/bin/SMILExtract-static progsrc/smilextract/SMILExtract-SMILExtract.o .libs/libopensmile.a -static $LDFLAGS $LIBS
  $CXX $CXXFLAGS -o $Pwdd/inst/android/bin/SMILExtract-static progsrc/smilextract/SMILExtract-SMILExtract.o .libs/libopensmile.a -static $LDFLAGS $LIBS
  if [ $? != 0 ]; then
  	echo "failed to install/build static openSMILE!";
	  exit -1;
  fi
  chmod 777 inst/android/bin/SMILExtract-static
else
  make install
  if [ $? != 0 ]; then
  	echo "failed to install/build dynamic openSMILE!";
	  exit -1;
  fi
fi

chmod 777 inst/android/bin/SMILExtract

echo ""
if [ "$STATIC_BIN" = "yes" ]; then
  echo "build successfull. You can now use the inst/android/bin/SMILExtract-static binary for Android. For linking with Android project, use builds in inst/android/lib folder."
else
  echo "build successfull. You can now use the inst/android/bin/SMILExtract binary for Android. For linking with Android project, use builds in inst/android/lib folder."
fi
echo ""

