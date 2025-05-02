
export function FlightLeg(obj) {

    this.AirlineCode = null;
    this.FlightNumber = null;
    this.SuffixCode = null;
    this.DepAirportCode = null;
    this.FlightDate = null;
    this.STD = null;
    this.STA = null;

    this.AcTypeCode = null;
    this.AcVersion = null;
    this.AircraftOwner = null;
    this.ArrAirportCode = null;
    this.ArrTerminal = null;
    this.CockpitCrewOwner = null;
    this.CabinCrewOwner = null;
    this.DepTerminal = null;
    this.JointOperationsAirlines = null;
    this.MealCodes = null;
    this.DepMinConnTimeStatus = null;
    this.ArrMinConnTimeStatus = null;
    this.OnwardAirlineCode = null;
    this.OnwardFlightNumber = null;
    this.OnwardAircraftLayover = null;
    this.OnwardSuffixCode = null;
    this.PRBD = null;
    this.PRBM = null;
    this.ServiceTypeCode = null;
    this.STALocalDiff = null;
    this.STDLocalDiff = null;
    this.STDLocal = null;
    this.STALocal = null;
    this.PSTA = null;
    this.PSTD = null;
    this.PSTALocal = null;
    this.PSTDLocal = null;
    this.Secure = null;
    this.Spare_123_127 = null;
    this.Spare_147_147 = null;
    this.Spare_162_172 = null;

    if (obj)
        for (let prop in obj) this[prop] = obj[prop];
}

