import { createContext } from "react";

export const AppContext = createContext()

const AppContextProvider = (props)=>{
    const currency = '₹'
    const calculateAge = (dob) => {
        const today = new Date();
        const birthDate = new Date(dob);
    
        let age = today.getFullYear() - birthDate.getFullYear();
    
        // Check if the birthday hasn't occurred yet this year
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
    
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }
    
        return age;
    };
    const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const slotDateFormat = (slotDate) => {
        const dateArray = slotDate.split('_');
        if (dateArray.length === 3) {
          return `${dateArray[0]} ${months[Number(dateArray[1])]} ${dateArray[2]}`;
        }
        return 'Invalid date';  // fallback in case slotDate format is wrong
      };
    const value={
        calculateAge,slotDateFormat,currency
    }
    return (
        <AppContext.Provider value ={value}>
            {props.children}
        </AppContext.Provider>
    )
}
export default AppContextProvider