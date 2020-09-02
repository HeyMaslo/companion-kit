import { ILocalization } from 'common/services/localization/ILocalization';
import Locations from 'common/models/Locations';

const L = () => ILocalization.getDefault().Locations;

const LocationStrings = {
    get [Locations.AtWork]() { return L().AtWork; },
    get [Locations.AtSchool]() { return L().AtSchool; },
    get [Locations.OnAWalk]() { return L().OnAWalk; },
    get [Locations.InThePark]() { return L().InThePark; },
    get [Locations.Somewhere]() { return L().Somewhere; },
    get [Locations.InTransit]() { return L().InTransit; },
    get [Locations.AtHome]() { return L().AtHome; },
};

export default LocationStrings;