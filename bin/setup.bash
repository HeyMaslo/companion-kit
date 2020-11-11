#!/bin/bash
which nvm
if [[ $? != 0 ]]; then
    #echo "No nvm installed" FIXME
    echo "node: $(node --version)"
    sleep 5
else
    nvm use
fi
mkdir mobile/dependencies
cd mobile/dependencies
git clone -b dev-ts https://github.com/HeyMaslo/maslo-persona.git persona
git clone https://github.com/HeyMaslo/react-native-switch-pro.git
cd ../..
yarn all
cd mobile/ios
pod install --repo-update
cd ..
yarn run ios
