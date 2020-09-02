import Locations from 'common/models/Locations';
import Images from 'src/constants/images';

import BagIconWhite from 'src/assets/images/locations/icon-bag-white.svg';
import BusIconWhite from 'src/assets/images/locations/icon-bus-white.svg';
import HomeIconWhite from 'src/assets/images/locations/icon-home-white.svg';
import MappinIconWhite from 'src/assets/images/locations/icon-mappin-white.svg';
import ParkIconWhite from 'src/assets/images/locations/icon-park-white.svg';
import PinIconWhite from 'src/assets/images/locations/icon-pin-white.svg';
import SchoolIconWhite from 'src/assets/images/locations/icon-school-white.svg';

export const LocationImages = {
    [Locations.AtWork]: Images.bagIcon,
    [Locations.AtSchool]: Images.bagIcon,
    [Locations.OnAWalk]: Images.mappinIcon,
    [Locations.InThePark]: Images.parkIcon,
    [Locations.Somewhere]: Images.pinIcon,
    [Locations.AtHome]: Images.homeIcon,
    [Locations.InTransit]: Images.busIcon,
};

export const LocationImagesWhite = {
    [Locations.AtWork]: BagIconWhite,
    [Locations.AtSchool]: SchoolIconWhite,
    [Locations.OnAWalk]: MappinIconWhite,
    [Locations.InThePark]: ParkIconWhite,
    [Locations.Somewhere]: PinIconWhite,
    [Locations.AtHome]: HomeIconWhite,
    [Locations.InTransit]: BusIconWhite,
};
