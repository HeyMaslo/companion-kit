#!/bin/bash
pods=1
yes=0
submodules=1
functions=1
dashboard=1
mobile=1
nvm_only=0
while getopts ":yp:s:f:d:m:n" opt; do
  case ${opt} in
    y ) yes=1
       ;;
    p ) pods=$OPTARG
      ;;
    s ) submodules=$OPTARG
      ;;
    f ) functions=$OPTARG
      ;;
    m ) mobile=$OPTARG
      ;;
    d ) dashboard=$OPTARG
      ;;
    m ) mobile=$OPTARG
      ;;
    n ) nvm_only=1
      ;;
    \? ) echo "Usage: setup [-y] [-p <val>] [-s <val>] [-f <val>] [-d <val>] [-m <val>] [-n]"
      ;;
  esac
done
export NVM_DIR="$(pwd)/.nvm"
if [ ! -d "$NVM_DIR" ]; then
    if [ $yes == 0 ]; then
        read -r -p "NVM Needed. Install it now? [Y/n] " confirm
        if [[ ! "$confirm" =~ ^[Yy]$ ]] ; then	
            echo "exiting."
            exit 0
        fi
    fi
	echo "Installing NVM"
	mkdir "$NVM_DIR"
	curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
else
	echo "NVM Installation found at $NVM_DIR"
fi
source "$NVM_DIR/nvm.sh"
echo "NVM Version:"
nvm --version
if [ $? != 0 ]; then
	echo "Error setting up NVM" && exit 1
fi
echo "Installing required node versions..."
nvm install 10 && nvm use 10
npm install --global yarn
nvm install 12 && nvm use 12
npm install --global yarn
dir () {
	echo "Changing to working directory: $1"
	cd $1 || exit 1
	nvm install
	nvm use
}
if [ $nvm_only == 1 ]; then
    exit 0
fi
dir .
yarn || exit 1
if [ ! -f ".env" ]; then
    echo "No env file installed!"
    if [ $yes == 0 ]; then
        read -r -p "Continue? [Y/n] " confirm
        if [[ ! "$confirm" =~ ^[Yy]$ ]] ; then	
            echo "exiting."
            exit 0
        fi
    fi
fi
yarn env:clean || exit 1 
yarn env:set || exit 1
if [ $submodules == 1 ]; then
	mkdir mobile/dependencies
	cd mobile/dependencies || exit 1
	git clone -b bipolarbridges-persona https://github.com/bipolarbridges/maslo-persona.git persona
	git clone https://github.com/HeyMaslo/react-native-switch-pro.git
	cd ../..
fi
if [ $functions == 1 ]; then
	dir server/functions
	yarn || exit 1 
	cd ../..
fi
if [ $dashboard == 1 ]; then
	dir dashboard
	yarn || exit 1
	cd ..
fi
if [ $mobile == 1 ]; then
    dir mobile/ios
    yarn
    if [ $pods == 1 ]; then
        pod install --repo-update
    fi
    cd ../..
fi
echo "Done."
