/**
 * Converts DMS to lonlat
 * ported from https://github.com/gmaclennan/parse-dms/blob/master/index.js
 * and https://stackoverflow.com/questions/37893131/how-to-convert-lat-long-from-decimal-degrees-to-dms-format
 */

type Direction =
  | "-"
  | "N"
  | "S"
  | "E"
  | "W";

function decDegFromMatch(
  m: Direction[]
) {
  var signIndex = {
    "-": -1,
    N: 1,
    S: -1,
    E: 1,
    W: -1,
  };

  var latLonIndex = {
    "-": "",
    N: "lat",
    S: "lat",
    E: "lon",
    W: "lon",
  };
  var degrees,
    minutes,
    seconds,
    sign,
    latLon;

  sign =
    signIndex[m[2]] ||
    signIndex[m[1]] ||
    signIndex[m[6]] ||
    1;
  degrees = Number(m[3]);
  minutes = m[4] ? Number(m[4]) : 0;
  seconds = m[5] ? Number(m[5]) : 0;
  latLon =
    latLonIndex[m[1]] ||
    latLonIndex[m[6]];

  if (!inRange(degrees, 0, 180))
    throw "Degrees out of range";
  if (!inRange(minutes, 0, 60))
    throw "Minutes out of range";
  if (!inRange(seconds, 0, 60))
    throw "Seconds out of range";

  return {
    decDeg:
      sign *
      (degrees +
        minutes / 60 +
        seconds / 3600),
    latLon: latLon,
  };
}

function inRange(
  value: number,
  a: number,
  b: number
) {
  return value >= a && value <= b;
}

function toDegreesMinutesAndSeconds(
  coordinate: number
) {
  let absolute = Math.abs(coordinate);
  let degrees = Math.floor(absolute);
  let minutesNotTruncated =
    (absolute - degrees) * 60;
  let minutes = Math.floor(
    minutesNotTruncated
  );
  let seconds = Math.floor(
    (minutesNotTruncated - minutes) * 60
  );
  return `${degrees} ${minutes} ${seconds}`;
}

function fromLonLatToDms(
  lon: number,
  lat: number
) {
  let latitude =
    toDegreesMinutesAndSeconds(lat);
  let latitudeCardinal =
    lat >= 0 ? "N" : "S";
  let longitude =
    toDegreesMinutesAndSeconds(lon);
  let longitudeCardinal =
    lon >= 0 ? "E" : "W";
  return `${latitude} ${latitudeCardinal} ${longitude} ${longitudeCardinal}`;
}

function fromDmsToLonLat(
  dmsString: string
):
  | { lon: number; lat: number }
  | number {
  dmsString = dmsString.trim();

  // Inspired by https://gist.github.com/JeffJacobson/2955437
  // See https://regex101.com/r/kS2zR1/3
  var dmsRe =
    /([NSEW])?(-)?(\d+(?:\.\d+)?)[°º:d\s]?\s?(?:(\d+(?:\.\d+)?)['’‘′:]\s?(?:(\d{1,2}(?:\.\d+)?)(?:"|″|’’|'')?)?)?\s?([NSEW])?/i;

  var dmsString2;

  let m1 = <Direction[]>(
    dmsString.match(dmsRe)
  );

  if (!m1)
    throw "Could not parse string";

  // If dmsString starts with a hemisphere letter, then the regex can also capture the
  // hemisphere letter for the second coordinate pair if also in the string
  if (m1[1]) {
    m1[6] = <any>undefined;
    dmsString2 = dmsString
      .substr(m1[0].length - 1)
      .trim();
  } else {
    dmsString2 = dmsString
      .substr(m1[0].length)
      .trim();
  }

  let decDeg1 = decDegFromMatch(m1);

  let m2 = <Direction[]>(
    dmsString2.match(dmsRe)
  );

  let decDeg2 =
    m2 && decDegFromMatch(m2);

  if (
    typeof decDeg1.latLon ===
    "undefined"
  ) {
    if (
      !isNaN(decDeg1.decDeg) &&
      decDeg2 &&
      isNaN(decDeg2.decDeg)
    ) {
      // If we only have one coordinate but we have no hemisphere value,
      // just return the decDeg number
      return decDeg1.decDeg;
    } else if (
      !isNaN(decDeg1.decDeg) &&
      decDeg2 &&
      !isNaN(decDeg2.decDeg)
    ) {
      // If no hemisphere letter but we have two coordinates,
      // infer that the first is lat, the second lon
      decDeg1.latLon = "lat";
      decDeg2.latLon = "lon";
    } else {
      throw "Could not parse string";
    }
  }

  // If we parsed the first coordinate as lat or lon, then assume the second is the other
  if (
    typeof decDeg2.latLon ===
    "undefined"
  ) {
    decDeg2.latLon =
      decDeg1.latLon === "lat"
        ? "lon"
        : "lat";
  }

  return <{ lon: number; lat: number }>{
    [decDeg1.latLon]: decDeg1.decDeg,
    [decDeg2.latLon]: decDeg2.decDeg,
  };
}

/**
 * Converts DMS<->LonLat
 * @param value A DMS string or lonlat coordinate to be converted
 */
export function parse(value: {
  lon: number;
  lat: number;
}): string;
export function parse(
  value: string
):
  | { lon: number; lat: number }
  | number;
export function parse(
  value:
    | string
    | { lon: number; lat: number }
):
  | { lon: number; lat: number }
  | number
  | string {
  if (typeof value === "string")
    return fromDmsToLonLat(value);
  return fromLonLatToDms(
    value.lon,
    value.lat
  );
}
