import { ValidationErrors , FormControl } from "@angular/forms";

export class ShopValidators {
    //whitespace validators

    static notOnlyWhiteSpace(control: FormControl) : ValidationErrors {
       
        //check if string only has whitespace
        if ((control.value!=null)&& (control.value.toString().trim().length ===0)) {
            
            //invalid, return error object
            return {'notOnlyWhiteSpace' : true};
        }else{
            return null;
        }

    }
}
