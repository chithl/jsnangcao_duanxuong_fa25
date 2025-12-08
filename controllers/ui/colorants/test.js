import { ColorantsAPI } from "../../api/ColorantsAPI.js";
const colorantsApi = new ColorantsAPI();

let getAll = async () => {
    let res = await colorantsApi.list();
    console.log(res);
}
        // let updateColorant = async () => {
        //     let res = await colorantsApi.updateColorant('-Ofw-yEZgGFrsScQLGGj', { name:'Updated Name' });
        //     console.log('Updated colorant:', res);
        // }
        // updateColorant();
// let createColorant = async () => {
// let res = await colorantsApi.storeColorant({ name:'Blue', unit:'ml', price_per_ml:'200000', isActive:true });
//     console.log('Created colorant:', res);
// }

// createColorant();
let getOne = async () => {
    let res = await colorantsApi.getOne('-Ofx0LWRkbtMf4WdL58h');
    console.log(res);
}
let deleteColorant = async () => {
    let res = await colorantsApi.deleteColorant('-Ofw-yEZgGFrsScQLGGj');
    console.log('Deleted colorant:', res);
}
deleteColorant();
getOne();
getAll();