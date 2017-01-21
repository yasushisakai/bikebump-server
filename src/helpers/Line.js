import Point from './Point'

/**
 * Line class
 */
export default class Line {

    constructor(_st, _en) {
        this.st = _st;
        this.en = _en;
    }

    /**
     * fromPoint
     * creates a Line Instance from one point , a direction and the length
     * @param _point
     * @param _direction
     * @param _length
     * @returns {Line}
     */
    static fromPoint(_point, _direction, _length) {
        // extends a point in both directions

        let unitizedDirection = _direction.unitize();
        let st = _point.add(unitizedDirection.multiply(_length * 0.5));
        let en = _point.add(unitizedDirection.flip().multiply(_length * 0.5));

        return new Line(st, en);

    }

    /**
     * fromObj
     * creates a Line Instance from an object having a st(start) and an en(end) object
     * @param obj
     * @returns {Line}
     */
    static fromObj(obj) {
        return new Line(Point.fromObj(obj.st), Point.fromObj(obj.en));
    }

    /**
     * fromArray
     * creates a Line Instance from two arrays, each having two coordinates
     * @param _stArry
     * @param _enArry
     * @returns {Line}
     */
    static fromArray(_stArry, _enArry) {
        return new Line(Point.fromArray(_stArry), Point.fromArray(_enArry));
    }

    getLength() {
        return this.st.distanceTo(this.en);
    }

    /**
     * getLengthInMeters
     * returns the length in Meters, defined from a line in LatLng coordinates
     * @returns {*}
     */
    getLengthInMeters() {
        return this.st.distanceToInMeters(this.en);
    }

    getDirection() {
        return this.en.subtract(this.st);
    }

    /**
     * getPointAt
     * returns a Point in a given parameter t (0<t<1)
     * @param _t
     * @returns {*}
     */
    getPointAt(_t) {
        let delta = this.en.subtract(this.st);
        return delta.multiply(_t).add(this.st);
    }

    /**
     * move
     * moves this line
     * THIS WILL MODIFY THE LINE, DESTRUCTIVE
     * @param _vector
     */
    move(_vector) {
        this.st.move(_vector);
        this.en.move(_vector);
    }

    /**
     * getClosestPointTo
     * returns the closest Point to a Point.
     * assures that the result will always be within the line.
     * expects LatLng Coordinates.
     * @param _point
     * @returns {*}
     */
    getClosestPointTo(_point) {

        let meInWorld = new Line(this.st.latLngToWorld(), this.en.latLngToWorld());
        let ptInWorld = _point.latLngToWorld();

        let len = meInWorld.getLength();

        let pointToEnd = meInWorld.en.subtract(ptInWorld);
        let angle = meInWorld.getDirection().angle(pointToEnd);


        let t = 1.0 - (pointToEnd.getLength() * Math.cos(angle) / len);

        t = Math.max(Math.min(1.0, t), 0.0);

        return this.getPointAt(t);

    }

    /**
     * getArray
     * getter function, converting to an array.
     * @returns {*[]}
     */
    getArray() {
        return [this.st.toArray(), this.en.toArray()]
    }

}
