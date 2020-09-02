import React, { Children } from 'react';
import { observer } from 'mobx-react';
import { View } from 'app/common/components';
import { DropdownProps }  from './Dropdown';
import Dropdown  from './Dropdown';

type DropdownListProps = DropdownProps & {
    items: Array<any>;
};

class DropdownList extends Dropdown<DropdownListProps>  {

    handleClickOutside = () => {
        this.closeDropdown();
    }

    renderChildren() {
        return (
            this.props.items.map((item, i) => {
                return <View key={i} className={`dropdown-item ${this.props.classNameItem}`}>{item}</View>;
            })
        );
    }
}

export default DropdownList;