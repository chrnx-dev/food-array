var today = new Date()
var dayDiff = 86400000
var initWeek = new Date(today - ((today.getDay() -1) * dayDiff ))
var setup = [7, 11, 14, 18, 21, 28]

print(today, initWeek, today.getDay())

db.groceries.deleteMany({})

print(initWeek)
db.groceries.insert({
        items: [
            {sku: "1", name: "Manzana", qty: NumberInt(Math.floor(Math.random() * 10))  }
        ],
        date: initWeek
    })

setup.forEach((daysAgo) => {
    db.groceries.insert({
        items: [
            {sku: "1", name: "Manzana", qty: NumberInt(Math.floor(Math.random() * 10))  }
        ],
        date: new Date(initWeek - (daysAgo*86400000))
    })
})