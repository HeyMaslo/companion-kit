
enum Locations {
    AtHome = 10,
    AtWork = 20,
    AtSchool = 21,
    InTransit = 30,
    OnAWalk = 40,
    InThePark = 50,
    Somewhere = 60,
}

namespace Locations {
    // const Helper = new EnumHelper<Locations>(Locations);

    const DefaultLocations = [
        Locations.AtHome,
        Locations.AtWork,
        Locations.InTransit,
        Locations.OnAWalk,
        Locations.InThePark,
        Locations.Somewhere,
    ];

    const LocationsForYouths = [
        Locations.AtHome,
        Locations.AtSchool,
        Locations.InTransit,
        Locations.OnAWalk,
        Locations.InThePark,
        Locations.Somewhere,
    ];

    export const ActiveItems = LocationsForYouths;
}

export default Locations;
