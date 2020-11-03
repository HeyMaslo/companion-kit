# TODO check tools
mkdir mobile/dependencies
cd mobile/dependencies
git clone -b dev-ts https://github.com/HeyMaslo/maslo-persona.git persona
git clone https://github.com/HeyMaslo/react-native-switch-pro.git
cd ../..
yarn all
cd mobile/ios
pod install --repo-update
cd ..
mkdir -p configs/app
yarn run ios
