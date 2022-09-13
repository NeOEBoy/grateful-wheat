import * as React from "react";
import { List, Datagrid, TextField, ReferenceField } from 'react-admin';

export const PostList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <ReferenceField source="userId" reference="users" />
            <TextField source="title" />
        </Datagrid>
    </List>
);