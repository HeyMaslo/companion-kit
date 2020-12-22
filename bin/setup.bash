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
echo "Cloning external dependencies..."
mkdir mobile/dependencies
cd mobile/dependencies
git clone -b dev-ts https://github.com/HeyMaslo/maslo-persona.git persona
git clone https://github.com/HeyMaslo/react-native-switch-pro.git
cd ../..
echo "Installing npm modules..."
yarn all
cd mobile/ios
pod install --repo-update
cd ..
echo "Done."
