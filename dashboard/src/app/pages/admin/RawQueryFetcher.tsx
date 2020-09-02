import React from 'react';
import JSONTree from 'react-json-tree';
import { useTable, TableOptions, CellProps } from 'react-table';
import { Text, Container, View, Button } from 'app/common/components';

import { Stats as StatsFunctions } from 'common/abstractions/functions';
import Firebase from 'common/services/firebase';

import StatsTypes = StatsFunctions.StatsTypes;
import { TextInputVM } from 'common/viewModels';
import { InputObservable } from 'app/common/components/Input';

export type Props = {
};

type State = {
    rawResult: any,
};

const InputSql = new TextInputVM({ value: 'SELECT * FROM users' });

let lastOutput: any = null;

function Table({ columns, data }: TableOptions<{}>) {
    // Use the state and functions returned from useTable to build your UI
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({
        columns,
        data,
    });

    // Render the UI for your table
    return (
        <table {...getTableProps()}>
            <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map(
                    (row, i) => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    return <td {...cell.getCellProps()}>
                                        {cell.render('Cell')}
                                    </td>;
                                })}
                            </tr>
                        );
                    },
                )}
            </tbody>
        </table>
    );
}

function TableForObject(props: { data: any }): JSX.Element {

    const arr = props.data && props.data.array;
    if (!arr || !Array.isArray(arr) || !arr.length) {
        return (
            <>
                {JSON.stringify(props.data || '', null, 2)}
            </>
        );
    }

    const keysSet = new Set<string>();
    arr.forEach(obj => {
        Object.keys(obj).forEach(k => {
            keysSet.add(k);
        });
    });
    const keys = Array.from(keysSet);

    const columns = React.useMemo(
        () => keys.map(k => ({
            Header: k,
            accessor: k,
            Cell: (row: CellProps<any>) => {
                const o = row.cell.value;
                if (o == null) {
                    return null;
                }
                if (typeof o === 'object') {
                    return <JSONTree data={o} />;
                }
                return o + '';
            },
        })),
        [ keys ],
    );

    return Table({ columns, data: arr });
}

export class RawQueryFetcher extends React.Component<Props, State> {

    state: State = {
        rawResult: null,
    };

    componentDidMount() {
        this.setState({
            rawResult: lastOutput,
        });
    }

    submit = async () => {
        await this.executeRawQuery();
    }

    private async executeRawQuery() {

        const result = await Firebase.Instance.getFunction(StatsFunctions.GetRawQuery)
            .execute({
                type: StatsTypes.RawQuery,
                query: InputSql.value,
            });

        if (Array.isArray(result.data)) {
            result.data = {
                LENGTH: result.data.length,
                array: result.data,
            };
        }

        lastOutput = result.data;
        // lastOutput = JSON.stringify(result.data, null, 2);
        this.setState({ rawResult: lastOutput });
    }

    render() {
        return (
            <Container className="raw-query">
                <View className="title-h6 white">
                    <Text>Use "__name__" to reference document id.</Text>
                </View>
                <View className="input-block">
                    <InputObservable className="light" label="Raw SQL Input" model={InputSql}  />
                    <Button
                        title="Submit"
                        onClick={this.submit}
                        className="submit"
                        titleClassName="label-btn4 up-text"
                    />
                </View>
                <View className="output-label">
                    <Text className="input-label">Output</Text>
                </View>
                <View className="output">
                    <TableForObject data={this.state.rawResult} />
                </View>
            </Container>
        );
    }
}
