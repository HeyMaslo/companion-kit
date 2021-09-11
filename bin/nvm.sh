status=0
if [ ! -f "$(pwd)/bin/setup.bash" ]; then
	echo "Please source this file from the project root"
	status=1
elif [ ! -d "./.nvm" ]; then
	status=1
	bash ./bin/setup.bash -n -y
	status=$?
fi

if [ $status != 0 ]; then
	echo "Sorry, this didn't work properly. Please try again."
else
	export NVM_DIR="$(pwd)/.nvm"
	source "$NVM_DIR/nvm.sh"
fi
