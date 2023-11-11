import {users, goals} from '../config/mongoCollections.js';

export function stringChecker(string){
    if(typeof string != 'string') throw `Input must be a string`;
    string = string.trim();
    if(string.length === 0) throw `String cannot be empty`;
    return string;
}

export function limitChecker(limit){
    if(typeof limit != "number") throw `Limit must be a valid number`;
    if(limit <= 0) throw `Limit must be a valid number greater than 0`;
    return limit;
}

export async function categoryChecker(userId, category){
    category = category.toLowerCase();
    const userCollection = await users();
    let result = await userCollection.findOne({_id: new ObjectId(userId)});
    let validCategories = result.categories;

    for(let i = 0; i < validCategories.length; i++){
        if(!validCategories[i].toLowerCase().equals(category)) throw `Category isn't valid for this user`
    }
    return category;
}

export function goalDateChecker(date){
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