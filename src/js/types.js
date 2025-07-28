/**
 * @typedef {Object} Track
 * @property {Array<Point>} points - Array of control points for the track
 * @property {Array<TrackSegment>} segments - Array of segments derived from control points
 * @property {number} baseWidth - Base width of the track
 * @property {string} baseColor - Base color of the track
 * @property {Array<Array<number>>} collisionMap - 2D array representing the collision map
 * @property {Date} createdAt - Date of creation
 * @property {string} name - Name of the track
 * @property {string} id - uuid of the track
 * @property {DrawOptions} drawOptions - draw options for the track
 */

// ! SOME POINT ADD ThiS BACK TO DRAW OPTIONS
// * @property {boolean} drawCenterLine - Draw the track with a center line
// * @property {boolean} drawControlIndex - Draw the control point index for the each point on track
/**
 * @typedef {Object} DrawOptions
 * @property {boolean} dotOutline - Draw the track with a dot outline
 * @property {boolean} fillTrack - Draw the track filled
 * @property {boolean} strokeTrack - Draw the track stroked
 * @property {boolean} drawControls - Draw the control points for the track
 * @property {boolean} drawCollisionMap - Ignore all other options and draw collision map
 *
 */

/**
 * @typedef {Object} TrackSegment
 * @property {Point|null} start - The starting point of the segment
 * @property {Point|null} control - The control point for the segment
 * @property {Point|null} end - The ending point of the segment
 * @property {string} [color] - Optional color for the segment
 * @property {number} [width] - Optional width for the segment
 * @property {{l: Array<{x: number, y: number}>, r: Array<{x: number, y: number}>}} edges - edges for the segment
 */

/**
 * @typedef {Object} Point
 * @property {number} x - The x-coordinate of the point
 * @property {number} y - The y-coordinate of the point
 * @property {boolean} [control] - Optional flag to indicate if this is a control point
 */

/**
 * @typedef {Object} SaveData
 * @property {Map<string, Track>} tracks - Saved tracks
 * @property {string} [defaultTrack] - Uuid of the default loaded track
 * @property {Array<string>} favourites - Favourite tracks
 */
