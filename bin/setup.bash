#!/bin/bash
pods=1
yes=0
submodules=1
functions=0
mobile=1
dashboard=1
while getopts ":ydp:s:f:m:a:" opt; do
  case ${opt} in
    y ) yes=1
      ;;
	d ) pods=0
		yes=1
		submodules=0
		functions=1
	  ;;
    p ) pods=$OPTARG
      ;;
    s ) submodules=$OPTARG
      ;;
    f ) functions=$OPTARG
      ;;
    m ) mobile=$OPTARG
      ;;
    a ) dashboard=$OPTARG
      ;;
    \? ) echo "Usage: setup [-y] [-p <val>] [-s <val>] [-f <val>] [-m <val>] [-a <val>]"
      ;;
  esac
done
echo "Checking node version:"
node --version
if [[ $? != 0 ]]; then
    echo "Node not installed!"
    exit 1
else
    if [ $yes == 0 ]; then
        read -r -p "Is this okay? [Y/n] " confirm
        if [[ ! $confirm =~ ^[Yy]$ ]] ; then	
            echo "exiting."
            exit 0
        fi
    fi
fi
yarn
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
yarn env:clean
yarn env:set
mkdir mobile/dependencies
if [ $submodules == 1 ]; then
	cd mobile/dependencies || exit 1
	git clone -b bipolarbridges-persona https://github.com/bipolarbridges/maslo-persona.git persona
	git clone https://github.com/HeyMaslo/react-native-switch-pro.git
	cd ../..
fi
if [ $functions == 1 ]; then
	cd server/functions || exit 1
	yarn
	cd ../..
fi
if [ $dashboard == 1 ]; then
	cd dashboard || exit 1
	yarn
	cd ..
fi
if [ $mobile == 1 ]; then
    cd mobile/ios || exit 1
    yarn
	if [ $pods == 1 ]; then
    	pod install --repo-update
	fi
    cd ../..
fi
echo "Done."
