// Step 1: Set up the chart area: width, height, margins
const svgWidth = 500;
const svgHeight = 400;

const margin = {
                top: 30,
                bottom: 50,
                right: 26,
                left: 50
                };

const chartWidth = svgWidth - margin.left - margin.right;
const chartHeight = svgHeight - margin.top - margin.bottom;

// Step 2: Create an SVG wrapper. Append g element to hold chart.
//          Transform to fit within the chart area margins.
const svg = d3.select('#scatter')
                .append('svg')
                .attr('width', svgWidth)
                .attr('height', svgHeight)
                .classed('chart', true);

const chartGroup = svg.append('g')
                    .attr('transform', `translate(${margin.left}, ${margin.top})`);

// Step 3: Import data from the csv file
d3.csv('assets/data/data.csv').then(function(healthData){
        // Step 4: Parse the data and convert to numerical
        healthData.forEach(d => {
        d.poverty = +d.poverty;
        d.healthcare = +d.healthcare;
        });

        // Step 5: Create linear scaling functions for x and y
        const xScale = d3.scaleLinear()
                        .domain([d3.min(healthData, d => d.poverty)-1,d3.max(healthData, d => d.poverty)+1])
                        .range([0, chartWidth]);

        const yScale = d3.scaleLinear()
                        .domain([d3.min(healthData, d => d.healthcare)-0.5,d3.max(healthData, d => d.healthcare)+2])
                        .range([chartHeight, 0]);

        // Step 6: Create axes functions
        const bottomAxis = d3.axisBottom(xScale),
                leftAxis = d3.axisLeft(yScale);

        // Step 7: Append the axes to the chart group
        chartGroup.append('g')
                .attr('transform', `translate(0, ${chartHeight})`)
                .call(bottomAxis);

        chartGroup.append('g')
                .call(leftAxis);

        // Step 8: Create circles
        const circleGroup = chartGroup.selectAll('circle')
                                .data(healthData)
                                .enter()
                                .append('circle')
                                .attr('cx', d => xScale(d.poverty))
                                .attr('cy', d => yScale(d.healthcare))
                                .attr('r', '10')
                                .classed('stateCircle', true);

        // Step 9: Include state abbreviations in the circles
        const stateText = chartGroup.selectAll('stateText')
                                .data(healthData)
                                .enter()
                                .append('text')
                                .attr('x', d => xScale(d.poverty))
                                .attr('y', d => yScale(d.healthcare)+3)
                                .text(d => d.abbr)
                                .classed('stateText', true);

        // Step 10: Create axes labels
        chartGroup.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', 0 - margin.left + 15)
                .attr('x', 0 - (chartHeight/2))
                .classed('aText', true)
                .text('Lacks Healthcare (%)');

        chartGroup.append('text')
                .attr('transform', `translate(${chartWidth/2},${chartHeight + margin.top + 15})`)
                .classed('aText', true)
                .text('In Poverty (%)');

}).catch(function(error){
    console.log(error);
});

// BONUS:
// 1. Put existing code into an init function
// 2. Append new text elements to Step 10 for the new axis titles:
//      Smokers (%) vs Age (Median)
//      Obese(%) vs Household Income (Median)
// 3. Parse all the data necessary to numeric
// 4. Create a click event handling function for the x and y variables
//      4.a. change color of selection
//      4.b. return selection value to be used in the circle group
// 5. Modify the circle group to include conditions depending on user selections
// 6. Modify the scaling functions to use the user selection 