import mongoose from "mongoose";

const dishSchema = new mongoose.Schema({
    vender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vender',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    imageUrl: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    avgRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    ratingTotal: {
        type: Number,
        default: 0
    },
    ratingCount: {
        type: Number,
        default: 0
    },
    tags: {
        type: [String],
        default: []
    },
    totalUnitsSold: {
        type: Number,
        default: 0
    },
    orderCount: {
        type: Number,
        default: 0
    },

}, { timestamps: true });

// Indexes for Dish
dishSchema.index({ vender: 1 });
dishSchema.index({ category: 1 });
dishSchema.index({ avgRating: -1 });
dishSchema.index({ price: 1 });

dishSchema.pre("save", async function () {
    if (this.isModified("ratingTotal") || this.isModified("ratingCount")) {
        this.avgRating = this.ratingCount > 0 ? Math.floor((this.ratingTotal / this.ratingCount) * 10) / 10 : 0
    }
})


export const Dish = mongoose.model('Dish', dishSchema);
