#!/bin/bash
pods=1
yes=0
while getopts ":yp:" opt; do
  case ${opt} in
    p ) pods=$OPTARG
      ;;
    y ) yes=1
      ;;
    \? ) echo "Usage: setup [-y] [-p <val>]"
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
        if [[ ! $confirm =~ ^[Yy]$ ]]; then	
            echo "exiting."
            exit 0
        fi
    fi
fi
yarn install
ls .env || exit 1
yarn env:set
mkdir mobile/dependencies
cd mobile/dependencies || exit 1
git clone -b dev-ts https://github.com/HeyMaslo/maslo-persona.git persona
git clone https://github.com/HeyMaslo/react-native-switch-pro.git
cd ../..
yarn all
if [ $pods == 1 ]; then
    cd mobile/ios || exit 1
    pod install --repo-update
    cd ../..
fi
echo "Done."
