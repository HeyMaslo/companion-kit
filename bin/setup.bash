#!/bin/bash
pods=1
yes=0
submodules=1
functions=1
dashboard=1
while getopts ":ydp:s:f:" opt; do
  case ${opt} in
	d ) pods=0
		yes=1
		submodules=1
		functions=1
	  ;;
    p ) pods=$OPTARG
      ;;
    s ) submodules=$OPTARG
      ;;
    f ) functions=$OPTARG
      ;;
    y ) yes=1
      ;;
    \? ) echo "Usage: setup [-y] [-p <val>] [-s <val>] [-f <val>]"
      ;;
  esac
done
export NVM_DIR=".nvm"
if [ ! -d "$NVM_DIR" ]; then
    read -r -p "NVM Needed. Install it now? [Y/n] " confirm
    if [ $yes == 0 ]; then
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
echo "Installing required node versions"
#nvm install 10
#nvm install 12
dir () {
	echo "Changing to working directory: $1"
	cd $1 || exit 1
	nvm install
	nvm use
}
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
if [ $pods == 1 ]; then
    dir mobile/ios
	yarn
    pod install --repo-update
    cd ../..
fi
echo "Done."
