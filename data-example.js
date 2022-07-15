var today = new Date()
var dayDiff = 86400000
var weekDayDiff = 7-today.getDay()
var initWeek = new Date(today - (weekDayDiff * dayDiff ))
var setup = [7, 11, 14, 18, 21, 28]

print(initWeek)
db.groceries.deleteMany({})

db.groceries.insert({
        items: [
            {sku: NumberInt(1), name: "Manzana", qty: NumberInt(Math.floor(Math.random() * 10))  }
        ],
        date: initWeek
    })

setup.forEach((daysAgo) => {
    db.groceries.insert({
        items: [
            {sku: NumberInt(1), name: "Manzana", qty: NumberInt(Math.floor(Math.random() * 10))  }
        ],
        date: new Date(initWeek - (daysAgo*86400000))
    })
})