import React from 'react';
// import { ReactSortable } from "react-sortablejs";

class cakeMenuManagement extends React.Component {
    constructor(props) {
        super(props);        
    }

    componentDidMount = async () => {
    }

    render() {
        return (
            <div>
                {/* <ReactSortable
                    list={this.state.list}
                    setList={(newState) => this.setState({ list: newState })}
                >
                    {this.state.list.map((item) => (
                        <div key={item.id}>{item.name}</div>
                    ))}
                </ReactSortable> */}
            </div>
        )
    }
}

export default cakeMenuManagement;
