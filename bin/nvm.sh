ok=1
if [ ! -f "$(pwd)/bin/setup.bash" ]; then
	echo "Please source this file from the project root"
	ok=0
elif [ ! -d "./.nvm" ]; then
	ok=0
	bash ./bin/setup.bash -n
	ok=$?
fi

if [ $ok != 1 ]; then
	echo "Sorry, this didn't work properly. Please try again."
else
	export NVM_DIR="$(pwd)/.nvm"
	source "$NVM_DIR/nvm.sh"
fi
