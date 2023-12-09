// import {users, goals} from '../config/mongoCollections.js';
import {users, goals} from './server/config/mongoCollections.js';
import {ObjectId} from 'mongodb';

export function stringChecker(string) {
    if(typeof string != 'string') throw `Input must be a string`;
    string = string.trim();
    if(string.length === 0) throw `String cannot be empty`;
    return string;
}

export function checkFireId(id) {
    let isFireId = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*$/.test(id);
    if (isFireId) {
      return id;
    }
    else {
      throw 'Not valid fire_id';
    }
}

export function checkAge(age) {
  if (Number.isNaN(Number(age)) || age < 13) {
    throw 'Invalid age :: checkAge()';
  }
  return parseInt(age);
}

export function checkEmail(email) {
  email = stringChecker(email);
  let isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValid) {
    throw "Invalid email address";
  }
  return email;
};

//can be used for displayName and userName
export function checkName(name, stringName) {
    name = stringChecker(name);
    if (stringName.toLowerCase().trim() === "username") {
      name = name.toLowerCase();
    }
    if (!(/^[a-zA-Z0-9]+$/.test(name)) || name.length < 8 || name.length > 20) {
      throw `${stringName} is invalid :: checkName`;
    }
    return name;
}

export function checkCategory(category) {
    category = stringChecker(category);
    category = category.toLowerCase();
    if (category.length > 30) {
      throw 'category name too long: checkCategory';
    }
    if (!/^[a-zA-Z0-9_.-]*[a-zA-Z][a-zA-Z0-9_. -]*$/.test(category)) { 
      //rn this takes multi word categories with numbers and _.-
      throw 'invalid category';
    }
    return category;
}

export function limitChecker(limit){
    if(typeof limit != "number") throw `Limit must be a valid number`;
    if(limit <= 0) throw `Limit must be a valid number greater than 0`;
    return limit;
}

export const checkPassword = (password) => {
  if (typeof password != 'string') {
    throw `Password must be a string`;
  }
  if (password.length === 0) {
    throw `Password cannot be empty`;
  }
  if (password.split(" ").length > 1) {
      throw `Password cannot contain spaces`;
  }
  if (password.length < 8) {
      throw `Password length must be at least 8`;
  }
  if (!/[A-Z]/.test(password)) {
      throw `Password must contain at least one uppercase character`;
  }
  if (!/\d/.test(password)) {
      throw `Password must contain at least one number`;
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw `Password must contain at least one special character`;
  }
  return password;
}

export async function categoryChecker(userId, category){
    category = category.toLowerCase();
    const userCollection = await users();
    // let result = await userCollection.findOne({_id: new ObjectId(userId)});
    let result = await userCollection.findOne({fire_id: userId})
    console.log("user: " + result)
    let validCategories = result.categories;

    let match = false
    for(let i = 0; i < validCategories.length; i++){
      let temp = validCategories[i].toLowerCase();
      if(temp === category){
        match = true;
      }
    }
    if(match === false) throw `Category isn't valid for this user`
    return category;
}

export function goalDateChecker(date){
    if(date[2] != '/' && date[5] != '/') throw `Date needs to be in the format 'MM/DD/YYYY'`
    let validMonths = ['01','02','03','04','05','06','07','08', '09', '10', '11', '12'];
    let present = false;
    //make sure the month matches 1 valid month
    for(let i = 0; i < validMonths.length; i++){
      if(validMonths[i] === date.substring(0,2)){
        present = true;
        break;
      }
    }
    if(present === false) throw `Invalid month`;

    //check to make sure the month lines up with dates
    if(date.substring(0,2) === "04" || date.substring(0,2) === "06" || date.substring(0,2) === "09" || date.substring(0,2) === "11"){
      if(parseInt(date.substring(3,5)) > 30 || parseInt(date.substring(3,5)) < 0) throw `Invalid day`;
    }
    else if(date.substring(0,2) === "01" || date.substring(0,2) === "03" || date.substring(0,2) === "05" || date.substring(0,2) === "07" || date.substring(0,2) === "08" || date.substring(0,2) === "10" || date.substring(0,2) === "12"){
      if(parseInt(date.substring(3,5)) > 31 || parseInt(date.substring(3,5)) < 0) throw `Invalid day`;
    }
    else{
      if(parseInt(date.substring(3,5)) > 28 || parseInt(date.substring(3,5)) < 0) throw `Invalid day`;
    }
    //used this link to get the current date: https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript
    let currDate = new Date();
    let month = currDate.getMonth() + 1;
    let day = currDate.getDate();
    let year = currDate.getFullYear();

    //now we have to compare to make sure that the goalDate is later than the curr date
    let goalMonth = parseInt(date.substring(0, 2));
    let goalDay = parseInt(date.substring(3,5));
    let goalYear = parseInt(date.substring(6));
    if(year > goalYear) throw `Goal Date must be a future date (invalid year)`
    if(year === goalYear && month > goalMonth) throw `Goal Date must be a future date (invalid month)`
    if(year === goalYear && month === goalMonth && day > goalDay) throw `Goal Date must be a future date (invalid day)`

    return date;
}

export function isBoolean(bool){
  if(typeof bool != "boolean") throw `Variale must be true or false`;
  return bool;
}

export function isIdArray(arr){
  for(let i = 0; i < arr.length; i++){
    if(!ObjectId.isValid(arr[i])){
      throw `Invalid ObjectId in array`
    }
  }

  return arr;
}

export function dateWithin7Days(date){//todays date is false, since goal may not yet be met
  if(date[2] != '/' && date[5] != '/') throw `Release date needs to be in the format 'MM/DD/YYYY'`
  let validMonths = ['01','02','03','04','05','06','07','08', '09', '10', '11', '12'];
  let present = false;
  //make sure the month matches 1 valid month
  for(let i = 0; i < validMonths.length; i++){
    if(validMonths[i] === date.substring(0,2)){
      present = true;
      break;
    }
  }
  if(present === false) throw `Invalid month`;

  //check to make sure the month lines up with dates
  if(date.substring(0,2) === "04" || date.substring(0,2) === "06" || date.substring(0,2) === "09" || date.substring(0,2) === "11"){
    if(parseInt(date.substring(3,5)) > 30 || parseInt(date.substring(3,5)) < 0) throw `Invalid day`;
  }
  else if(date.substring(0,2) === "01" || date.substring(0,2) === "03" || date.substring(0,2) === "05" || date.substring(0,2) === "07" || date.substring(0,2) === "08" || date.substring(0,2) === "10" || date.substring(0,2) === "12"){
    if(parseInt(date.substring(3,5)) > 31 || parseInt(date.substring(3,5)) < 0) throw `Invalid day`;
  }
  else{
    if(parseInt(date.substring(3,5)) > 28 || parseInt(date.substring(3,5)) < 0) throw `Invalid day`;
  }
  //used this link to get the current date: https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript
  let currDate = new Date();
  currDate.setHours(0, 0, 0, 0);
  let month = date.substring(0,2);
  let day = date.substring(3,5);
  let year = date.substring(6,10);
  
  let sevenDaysAgo = new Date(currDate);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const inputedDateObj = new Date(year, month - 1, day);

  if (inputedDateObj < sevenDaysAgo || inputedDateObj >= currDate)
  {
    return false;
  }
  else
  {
    return true;
  }
}

export function dateIsInThePast(date){//todays date is false, goals with this date not in past
  if(date[2] != '/' && date[5] != '/') throw `Release date needs to be in the format 'MM/DD/YYYY'`
  let validMonths = ['01','02','03','04','05','06','07','08', '09', '10', '11', '12'];
  let present = false;
  //make sure the month matches 1 valid month
  for(let i = 0; i < validMonths.length; i++){
    if(validMonths[i] === date.substring(0,2)){
      present = true;
      break;
    }
  }
  if(present === false) throw `Invalid month`;

  //check to make sure the month lines up with dates
  if(date.substring(0,2) === "04" || date.substring(0,2) === "06" || date.substring(0,2) === "09" || date.substring(0,2) === "11"){
    if(parseInt(date.substring(3,5)) > 30 || parseInt(date.substring(3,5)) < 0) throw `Invalid day`;
  }
  else if(date.substring(0,2) === "01" || date.substring(0,2) === "03" || date.substring(0,2) === "05" || date.substring(0,2) === "07" || date.substring(0,2) === "08" || date.substring(0,2) === "10" || date.substring(0,2) === "12"){
    if(parseInt(date.substring(3,5)) > 31 || parseInt(date.substring(3,5)) < 0) throw `Invalid day`;
  }
  else{
    if(parseInt(date.substring(3,5)) > 28 || parseInt(date.substring(3,5)) < 0) throw `Invalid day`;
  }
  //used this link to get the current date: https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript
  let currDate = new Date();
  currDate.setHours(0, 0, 0, 0);
  let month = date.substring(0,2);
  let day = date.substring(3,5);
  let year = date.substring(6,10);
  
  let sevenDaysAgo = new Date(currDate);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const inputedDateObj = new Date(year, month - 1, day);

  if (inputedDateObj < currDate)
  {
    return true;
  }
  else
  {
    return false;
  }
}

export function validId(id){
  id = id.trim();
  if(!ObjectId.isValid(id)) throw 'Invalid user id';
  return id;
}