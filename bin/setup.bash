#!/bin/bash
echo "Checking node version:"
node --version
if [[ $? != 0 ]]; then
    echo "Node not installed!"
    exit 1
else
	read -r -p "Is this okay? [Y/n] " confirm
	if [[ ! $confirm =~ ^[Yy]$ ]]; then	
		echo "exiting."
		exit 0
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
cd mobile/ios || exit 1
pod install --repo-update
cd ..
echo "Done."
