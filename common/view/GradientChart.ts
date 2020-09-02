import * as d3 from 'd3';

function getScalers(data: Point[], height: number, width: number) {
    const minX = Math.min(...data.map(el => el.x));
    const maxX = Math.max(...data.map(el => el.x));
    // const minY = Math.min(...data.map(el => el.y));
    // const maxY = Math.max(...data.map(el => el.y));

    const x = d3.scaleLinear()
        .domain([minX, maxX])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, 1])
        .range([height, 0]);

    return { x, y };
}

// returns normalised coordintates of svg points
export function getDotsCoords(data: Point[], height: number, width: number) {
    const { x, y } = getScalers(data, height, width);

    return data.map(p => ({
        x: x(p.x),
        y: y(p.y),
    }));
}

type Point = {
    x: number;
    y: number;
};

// returns d attribute of path (line)
export function getPathCoords(data: Point[], height: number, width: number) {
    const { x, y } = getScalers(data, height, width);

    const pathD = d3.line<Point>()
        .x(d => x(d.x))
        .y(d => y(d.y))
        .curve(d3.curveMonotoneX);

    return pathD(data);
}

// returns d attribute of path (area under the line)
export function getAreaCords(data: Point[], height: number, width: number) {
    const { x, y } = getScalers(data, height, width);

    const pathD = d3.area<Point>()
        .x(d => x(d.x))
        .y0(d => y(d.y))
        .y1(d => height)
        .curve(d3.curveMonotoneX);

    return pathD(data);
}
