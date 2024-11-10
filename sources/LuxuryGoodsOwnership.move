module metaschool::LuxuryGoodsOwnership {
    use std::string::String;
    use std::signer;
    use std::vector;

    // Define a struct to hold luxury item details
    struct LuxuryItem has key {
        item_name: String,
        owner: address,
        transfer_history: vector<address>,
    }

    // Function to register a new luxury item
    public entry fun register_item(account: &signer, item_name: String) acquires LuxuryItem {
        let owner_address = signer::address_of(account);
        
        // Check if the item already exists for the account
        if (exists<LuxuryItem>(owner_address)) {
            let item = borrow_global_mut<LuxuryItem>(owner_address);
            item.item_name = item_name;  // Update item name if re-registered
            item.transfer_history = vector::empty<address>();  // Reset history on re-registration
            vector::push_back(&mut item.transfer_history, owner_address);
        } else {
            let new_item = LuxuryItem {
                item_name: item_name,
                owner: owner_address,
                transfer_history: vector::empty<address>(),
            };
            vector::push_back(&mut new_item.transfer_history, owner_address);
            move_to(account, new_item);
        }
    }

    // Function to view the current owner and transfer history of a luxury item
    public fun view_item(account: &signer): (String, address, vector<address>) acquires LuxuryItem {
        let item = borrow_global<LuxuryItem>(signer::address_of(account));
        (item.item_name, item.owner, item.transfer_history)
    }

    // Function to transfer ownership of the luxury item
    public entry fun transfer_ownership(
        current_owner: &signer, 
        new_owner: address
    ) acquires LuxuryItem {
        let item = borrow_global_mut<LuxuryItem>(signer::address_of(current_owner));

        // Update the owner and record transfer in the history
        item.owner = new_owner;
        vector::push_back(&mut item.transfer_history, new_owner);
    }
}
