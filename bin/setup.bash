#!/bin/bash
pods=1
yes=0
submodules=1
functions=0
while getopts ":ydp:s:f:" opt; do
  case ${opt} in
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
    y ) yes=1
      ;;
    \? ) echo "Usage: setup [-y] [-p <val>] [-s <val>] [-f <val>]"
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
	git clone -b dev-ts https://github.com/HeyMaslo/maslo-persona.git persona
	git clone https://github.com/HeyMaslo/react-native-switch-pro.git
	cd ../..
fi
if [ $functions == 1 ]; then
	cd server/functions || exit 1
	yarn
	cd ../..
fi
if [ $pods == 1 ]; then
	yarn all
    cd mobile/ios || exit 1
    pod install --repo-update
    cd ../..
fi
echo "Done."
