async function loadData() {

const response = await fetch("data/budsjettdata.json")
const data = await response.json()

return data

}

function groupByDepartment(data) {

const result = {}

data.forEach(row => {

if (!result[row.departement]) {
result[row.departement] = 0
}

result[row.departement] += row.bevilgning

})

return result

}

function drawDeptChart(grouped) {

const ctx = document.getElementById("deptChart")

new Chart(ctx, {

type: "bar",

data: {
labels: Object.keys(grouped),

datasets: [{
label: "Budsjett per departement",
data: Object.values(grouped)
}]

}

})

}

function createInsights(data) {

const sorted = [...data].sort((a,b) => b.bevilgning - a.bevilgning)

const largest = sorted[0]

const insightList = document.getElementById("insightList")

let li = document.createElement("li")

li.innerText = "Største budsjettpost er " + largest.navn

insightList.appendChild(li)

}

async function init() {

const data = await loadData()

const grouped = groupByDepartment(data)

drawDeptChart(grouped)

createInsights(data)

}

init()
