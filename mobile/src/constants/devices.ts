import Constants from 'expo-constants';

type NotchDevice = {
    brand: string;
    model: string;
    [key: string]: string;
};

let notch: boolean;

export function hasNotch() {
    if (notch == null) {
        const { ios } = Constants.platform;
        const androidDeviceModel: string = Constants.deviceName;
        const _model = ios ? ios.model : androidDeviceModel;

        if (!_model) {
            return false;
        }

        if (ios) {
            const notchDeviceIndex = devicesWithNotch.findIndex(item => item.model.toLowerCase() === _model.toLowerCase());
            notch = notchDeviceIndex !== -1;
        } else {
            const otherModel = _model.toLowerCase();
            notch = devicesWithNotch.some(item => {
                const itemModel = item.model.toLowerCase();
                return otherModel.indexOf(itemModel) !== -1;
            });
        }
    }
    return notch;
}

const devicesWithNotch: Array<NotchDevice> = [
    {
        brand: 'Apple',
        model: 'iPhone 11',
    },
    {
        brand: 'Apple',
        model: 'iPhone 11 Pro',
    },
    {
        brand: 'Apple',
        model: 'iPhone 11 Pro Max',
    },
    {
        brand: 'Apple',
        model: 'iPhone X',
    },
    {
        brand: 'Apple',
        model: 'iPhone XS',
    },
    {
        brand: 'Apple',
        model: 'iPhone XS Max',
    },
    {
        brand: 'Apple',
        model: 'iPhone XR',
    },
    {
        brand: 'Asus',
        model: 'ZenFone 5',
    },
    {
        brand: 'Asus',
        model: 'ZenFone 5z',
    },
    {
        brand: 'google',
        model: 'Pixel 3 XL',
    },
    {
        brand: 'Huawei',
        model: 'P20',
    },
    {
        brand: 'Huawei',
        model: 'P20 Plus',
    },
    {
        brand: 'Huawei',
        model: 'P20 Lite',
    },
    {
        brand: 'Huawei',
        model: 'ANE-LX1',
    },
    {
        brand: 'Huawei',
        model: 'INE-LX1',
    },
    {
        brand: 'Huawei',
        model: 'Honor 10',
    },
    {
        brand: 'Huawei',
        model: 'Mate 20 Lite',
    },
    {
        brand: 'Huawei',
        model: 'Mate 20 Pro',
    },
    {
        brand: 'Huawei',
        model: 'P30 Lite',
    },
    {
        brand: 'Huawei',
        model: 'P30 Pro',
    },
    {
        brand: 'Huawei',
        model: 'Nova 3',
    },
    {
        brand: 'Huawei',
        model: 'Nova 3i',
    },
    {
        brand: 'Leagoo',
        model: 'S9',
    },
    {
        brand: 'LG',
        model: 'G7',
    },
    {
        brand: 'LG',
        model: 'G7 ThinQ',
    },
    {
        brand: 'LG',
        model: 'G7+ ThinQ',
    },
    {
        brand: 'LG',
        model: 'LM-Q910', // G7 One
    },
    {
        brand: 'LG',
        model: 'LM-G710', // G7 ThinQ
    },
    {
        brand: 'LG',
        model: 'LM-V405', // V40 ThinQ
    },
    {
        brand: 'Motorola',
        model: 'Moto g7 Play',
    },
    {
        brand: 'Motorola',
        model: 'Moto g7 Power',
    },
    {
        brand: 'Motorola',
        model: 'Motorola One',
    },
    {
        brand: 'Nokia',
        model: '5.1 Plus',
    },
    {
        brand: 'Nokia',
        model: '6.1 Plus',
    },
    {
        brand: 'Nokia',
        model: '7.1',
    },
    {
        brand: 'Nokia',
        model: '8.1',
    },
    {
        brand: 'OnePlus',
        model: '6',
    },
    {
        brand: 'OnePlus',
        model: 'A6003',
    },
    {
        brand: 'ONEPLUS',
        model: 'A6000',
    },
    {
        brand: 'OnePlus',
        model: 'OnePlus A6003',
    },
    {
        brand: 'OnePlus',
        model: 'ONEPLUS A6010',
    },
    {
        brand: 'OnePlus',
        model: 'ONEPLUS A6013',
    },
    {
        brand: 'OnePlus',
        model: 'ONEPLUS A6000',
    },
    {
        brand: 'Oppo',
        model: 'R15',
    },
    {
        brand: 'Oppo',
        model: 'R15 Pro',
    },
    {
        brand: 'Oppo',
        model: 'F7',
    },
    {
        brand: 'Oukitel',
        model: 'U18',
    },
    {
        brand: 'Sharp',
        model: 'Aquos S3',
    },
    {
        brand: 'Vivo',
        model: 'V9',
    },
    {
        brand: 'Vivo',
        model: 'X21',
    },
    {
        brand: 'Vivo',
        model: 'X21 UD',
    },
    {
        brand: 'xiaomi',
        model: 'MI 8',
    },
    {
        brand: 'xiaomi',
        model: 'MI 8 Explorer Edition',
    },
    {
        brand: 'xiaomi',
        model: 'MI 8 SE',
    },
    {
        brand: 'xiaomi',
        model: 'MI 8 UD',
    },
    {
        brand: 'xiaomi',
        model: 'MI 8 Lite',
    },
    {
        brand: 'xiaomi',
        model: 'POCO F1',
    },
    {
        brand: 'xiaomi',
        model: 'POCOPHONE F1',
    },
    {
        brand: 'xiaomi',
        model: 'Redmi 6 Pro',
    },
    {
        brand: 'xiaomi',
        model: 'Redmi Note 6 Pro',
    },
    {
        brand: 'xiaomi',
        model: 'Redmi Note 7',
    },
    {
        brand: 'xiaomi',
        model: 'Mi A2 Lite',
    },
];

export default devicesWithNotch;
