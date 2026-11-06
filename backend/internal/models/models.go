package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Name      string             `bson:"name" json:"name"`
	Email     string             `bson:"email" json:"email"`
	Password  string             `bson:"password" json:"-"`
	CartData  map[string]float64 `bson:"cartData" json:"cartData"`
	IsAdmin   bool               `bson:"isAdmin" json:"isAdmin"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type Food struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Name        string             `bson:"name" json:"name"`
	Description string             `bson:"description" json:"description"`
	Category    string             `bson:"category" json:"category"`
	Image       string             `bson:"image" json:"image"`
	Price       float64            `bson:"price" json:"price"`
	Vegetarian  bool               `bson:"vegetarian" json:"vegetarian"`
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type OrderItem struct {
	FoodID   primitive.ObjectID `bson:"foodId" json:"foodId"`
	Name     string             `bson:"name" json:"name"`
	Quantity float64            `bson:"quantity" json:"quantity"`
	Price    float64            `bson:"price" json:"price"`
	Image    string             `bson:"image" json:"image"`
}

type Address struct {
	Name    string `bson:"name" json:"name"`
	Phone   string `bson:"phone" json:"phone"`
	Email   string `bson:"email" json:"email"`
	Address string `bson:"address" json:"address"`
	City    string `bson:"city" json:"city"`
	State   string `bson:"state" json:"state"`
	PinCode string `bson:"pinCode" json:"pinCode"`
}

type Payment struct {
	Method        string `bson:"method" json:"method"`
	Paid          bool   `bson:"paid" json:"paid"`
	TransactionID string `bson:"transactionId" json:"transactionId"`
}

type Order struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	OrderID   string             `bson:"orderId,omitempty" json:"orderId,omitempty"`
	VegTag    string             `bson:"vegTag" json:"vegTag"`
	UserID    primitive.ObjectID `bson:"userId" json:"userId"`
	Items     []OrderItem        `bson:"items" json:"items"`
	Amount    float64            `bson:"amount" json:"amount"`
	Address   Address            `bson:"address" json:"address"`
	Payment   Payment            `bson:"payment" json:"payment"`
	Status    string             `bson:"status" json:"status"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt"`
	User      *PublicUser        `bson:"-" json:"-"`
}

type PublicUser struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Name      string             `bson:"name" json:"name"`
	Email     string             `bson:"email" json:"email"`
	IsAdmin   bool               `bson:"isAdmin" json:"isAdmin"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
}

type Claims struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Email   string `json:"email"`
	IsAdmin bool   `json:"isAdmin"`
}
