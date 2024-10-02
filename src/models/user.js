import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name: { type: String },
    role: {
        type: String,
        enum: ["Customer", "Admin", "DeliveryPartner"],
        required: true,
    },
    isActivated: { type: Boolean, default: false },
});

const customerSchema = new mongoose.Schema({
    ...userSchema.obj,

    phone: { type: Number, required: true, unique: true },
    role: { type: String, enum: ["Customer"], default: "Customer" },
    liveLocation: {
        latitude: { type: Number },
        longitude: { type: Number },
    },
    address: { type: String },
});

const deliveryPartnerSchema = new mongoose.Schema({
    ...userSchema.obj,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: Number, required: true },
    role: {
        type: String,
        enum: ["DeliveryPartner"],  
        default: "DeliveryPartner"
    },
    liveLocation: {
        latitude: { type: Number },
        longitude: { type: Number },
    },
    address: { type: String },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch"
    },
});

const adminSchema = new mongoose.Schema({
    ...userSchema.obj,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ["Admin"],
        default: "Admin"
    },
});

// Exporting models
export const Customer = mongoose.model("Customer", customerSchema);
export const DeliveryPartner = mongoose.model("DeliveryPartner", deliveryPartnerSchema);
export const Admin = mongoose.model("Admin", adminSchema);

