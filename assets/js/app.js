// Step 1: Set up the chart area: width, height, margins
const svgWidth = 500;
const svgHeight = 400;

const margin = {
top: 30,
bottom: 100,
right: 26,
left: 100
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

// Initial params. These will change depending on user selection   
let userSelection = ['poverty', 'healthcare'];

// create functions to scale the axes based on user selection
function xScale (healthData, userSelection){
        const newXScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[userSelection[0]])-1,d3.max(healthData, d => d[userSelection[0]])+1])
        .range([0, chartWidth]);

        return newXScale;
};

function yScale (healthData, userSelection){
        const newYScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[userSelection[1]])-0.5,d3.max(healthData, d => d[userSelection[1]])+2])
        .range([chartHeight, 0]);

        return newYScale;
};

// create functions to render the new axes
function renderNewXAxis (newXScale,xAxis){
        const bottomAxis = d3.axisBottom(newXScale);
        xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

        return xAxis;
};

function renderNewYAxis (newYScale,yAxis){
        const leftAxis = d3.axisLeft(newYScale);
        yAxis.transition()
        .duration(1000)
        .call(leftAxis);

        return yAxis;
}

// create a function to update the circles group based on user selection
function renderCircles (circleGroup, newXScale, newYScale, userSelection){
        circleGroup.transition()
        .duration(1000)
        .attr('cx', d => newXScale(d[userSelection[0]]))
        .attr('cy', d => newYScale(d[userSelection[1]]))
        .attr('r', '10');
};

// create a function to modify the state labels based on user selection
// function renderStateLabels (stateText, newXScale, newYScale, userSelection){
//         stateText.transition()
//         .duration(1000)
//         .attr('x', d => newXScale(d[userSelection[0]]))
//         .attr('y', d => newYScale(d[userSelection[1]]))
//         .text(d => d.abbr)
//         .classed('stateText', true);
// };

// Step 3: Import data from the csv file
d3.csv('assets/data/data.csv').then(function(healthData){

// Step 4: Parse the data and convert to numerical
healthData.forEach(d => {
   d.poverty = +d.poverty;
   d.healthcare = +d.healthcare;
   d.age = +d.age;
   d.income = +d.income;
   d.smokes = +d.smokes;
   d.obesity = +d.obesity;
});


// Step 5: Create linear scaling functions for x and y
let xLinearScale = xScale(healthData,userSelection);

let yLinearScale = yScale(healthData,userSelection);

// Step 6: Create axes functions
const bottomAxis = d3.axisBottom(xLinearScale),
leftAxis = d3.axisLeft(yLinearScale);

// Step 7: Append the axes to the chart group
let xAxis = chartGroup.append('g')
        // .classed('active', true)
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(bottomAxis);

let yAxis = chartGroup.append('g')
        // .classed('active', true)
        .call(leftAxis);

// Step 8: Create circles
let circleGroup = chartGroup.selectAll('circle')
        .data(healthData)
        .enter()
        .append('circle')
        .attr('cx', d => xLinearScale(d[userSelection[0]]))
        .attr('cy', d => yLinearScale(d[userSelection[1]]))
        .attr('r', '10')
        .classed('stateCircle', true);

// Step 9: Include state abbreviations in the circles
let stateText = chartGroup.selectAll('stateText')
        .data(healthData)
        .enter()
        .append('text')
        .attr('x', d => xLinearScale(d[userSelection[0]]))
        .attr('y', d => yLinearScale(d[userSelection[1]])+3)
        .text(d => d.abbr)
        .classed('stateText', true);

// Step 10: Create axes labels
const xlabelsGroup = chartGroup.append('g')
        .attr('transform', `translate(${chartWidth/2},${chartHeight + margin.top + 10})`)

const ylabelGroup = chartGroup.append('g')
        .attr('transform', 'rotate(-90)')

const xPovertyAxisLabel = xlabelsGroup.append('text')
        .attr('x', 0)
        .attr('y', 0)
        .attr('value', 'poverty') // value to grab for event listener
        .classed('aText active', true)
        .text('In Poverty (%)');

const xAgeAxisLabel = xlabelsGroup.append('text')
        .attr('x', 0)
        .attr('y', 20)
        .attr('value', 'age') // value to grab for event listener
        .classed('aText inactive', true)
        .text('Age (Median)');

const xIncomeAxisLabel = xlabelsGroup.append('text')
        .attr('x', 0)
        .attr('y', 40)
        .attr('value', 'income') // value to grab for event listener
        .classed('aText inactive', true)
        .text('Household Income (Median)');

const yHealthAxisLabel = ylabelGroup.append('text')
        .attr('y', 0 - margin.left + 65)
        .attr('x', 0 - (chartHeight/2))
        .attr('value', 'healthcare') // value to grab for event listener
        .classed('aText active', true)
        .text('Lacks Healthcare (%)');

const ySmokesAxisLabel = ylabelGroup.append('text')
        .attr('y', 0 - margin.left + 40)
        .attr('x', 0 - (chartHeight/2))
        .attr('value', 'smokes') // value to grab for event listener
        .classed('aText inactive', true)
        .text('Smokes (%)');

const yObeseAxisLabel = ylabelGroup.append('text')
        .attr('y', 0 - margin.left + 15)
        .attr('x', 0 - (chartHeight/2))
        .attr('value', 'obesity') // value to grab for event listener
        .classed('aText inactive', true)
        .text('Obese (%)');

// Step 11: Add labels group event listeners
xlabelsGroup.selectAll('text').on('click', function(){
        const value = d3.select(this).attr('value');
        if (value !== userSelection[0]){
                // replace the first item in the user selection array with value
                userSelection[0] = value;

                // update xScale for new data
                xLinearScale = xScale(healthData, userSelection);

                // update x axis with transition
                xAxis = renderNewXAxis(xLinearScale, xAxis);

                // update circles with new x values
                circleGroup = renderCircles(circleGroup, xLinearScale, yLinearScale, userSelection);

                // update state text with new x values
                // stateText = renderStateLabels(stateText, xLinearScale, yLinearScale, userSelection);

                // change classes
                if (userSelection === 'age') {
                        xPovertyAxisLabel
                        .classed('active', false)
                        .classed('inactive', true);
                        xAgeAxisLabel
                        .classed('active', true)
                        .classed('inactive', false);
                        xIncomeAxisLabel
                        .classed('active', false)
                        .classed('inactive', true);
                }
                else if(userSelection === 'income'){
                        xPovertyAxisLabel
                        .classed('active', false)
                        .classed('inactive', true);
                        xAgeAxisLabel
                        .classed('active', false)
                        .classed('inactive', true);
                        xIncomeAxisLabel
                        .classed('active', true)
                        .classed('inactive', false);
                }
                else{
                        xPovertyAxisLabel
                        .classed('active', true)
                        .classed('inactive', false);
                        xAgeAxisLabel
                        .classed('active', false)
                        .classed('inactive', true);
                        xIncomeAxisLabel
                        .classed('active', false)
                        .classed('inactive', true);
                }
        }
});

ylabelGroup.selectAll('text').on('click', function(){
        const value = d3.select(this).attr('value');
        if (value !== userSelection[1]){
                // replace the first item in the user selection array with value
                userSelection[1] = value;

                // update xScale for new data
                yLinearScale = yScale(healthData, userSelection);

                // update x axis with transition
                yAxis = renderNewYAxis(yLinearScale, yAxis);

                // update circles with new x values
                circleGroup = renderCircles(circleGroup, xLinearScale, yLinearScale, userSelection);

                // update state text with new x values
                // stateText = renderStateLabels(stateText, xLinearScale, yLinearScale, userSelection);

                // change classes
                if (userSelection === 'smokes') {
                        yHealthAxisLabel
                        .classed('active', false)
                        .classed('inactive', true);
                        ySmokesAxisLabel
                        .classed('active', true)
                        .classed('inactive', false);
                        yObeseAxisLabel
                        .classed('active', false)
                        .classed('inactive', true);
                }
                else if(userSelection === 'obesity'){
                        yHealthAxisLabel
                        .classed('active', false)
                        .classed('inactive', true);
                        ySmokesAxisLabel
                        .classed('active', false)
                        .classed('inactive', true);
                        yObeseAxisLabel
                        .classed('active', true)
                        .classed('inactive', false);
                }
                else{
                        yHealthAxisLabel
                        .classed('active', true)
                        .classed('inactive', false);
                        ySmokesAxisLabel
                        .classed('active', false)
                        .classed('inactive', true);
                        yObeseAxisLabel
                        .classed('active', false)
                        .classed('inactive', true);
                }
        }
});

}).catch(function(error){
console.log(error);
});


// BONUS:
// 4. Create a click event handling function for the x and y variables
//      4.a. change color of selection
//      4.b. return selection value to be used in the circle group
// 5. Modify the circle group to include conditions depending on user selections
// 6. Modify the scaling functions to use the user selection 

// create an event handling function that appends the selected axis to an array
// use the elements in the array to modify the chart