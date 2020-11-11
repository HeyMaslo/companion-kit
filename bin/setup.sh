# TODO check tools
# TODO check npm version
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
