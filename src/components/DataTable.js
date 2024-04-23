import { useState, useEffect, useRef } from "react";
import axios from 'axios';

import { LocationOn } from '@mui/icons-material';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import Box from '@mui/material/Box';


function DataTable () {
    const area_list = [
        '北投區',
        '士林區',
        '中山區',
        '內湖區',
        '大同區',
        '松山區',
        '萬華區',
        '中正區',
        '大安區',
        '信義區',
        '南港區',
        '文山區'
    ];
    const [selected_area, set_selected_area] = useState('北投區');
    
    const [api_data, set_api_data] = useState([]);
    const display_data = useRef([]);

    //頁碼相關
    const [rows_per_page, set_rows_per_page] = useState(10);
    const [page, set_page] = useState(0);
    const handleChangeRowsPerPage = (event) => {
        set_rows_per_page(parseInt(event.target.value, 10));
        set_page(0);
    };

    const handleChangePage = (event, newPage) => {
        set_page(newPage);
    };

    const get_api_data = () => {
        axios.get('https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json')
            .then(res => {
                const data = res.data;
                set_api_data(data);
            })
    };

    const get_display_data = (api_data) => {
        //過濾出所選的行政區資料
        return api_data.filter(x => selected_area.includes(x.sarea));
    };

    const goToMap = (lat, lng) => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
    };

    const selected_btn_style = {
        backgroundColor: '#b9c00c',
        color: 'white',
        margin: '5px 5px 15px'
    };
    const btn_style = {
        backgroundColor: 'transparent',
        color: '#b9c00c',
        margin: '5px 5px 15px'
    };

    useEffect(() => {   
        get_api_data(); 

        setTimeout(() => {
            get_api_data();
        }, 60000);
    });

    useEffect(() => {
        display_data.current = get_display_data(api_data);
    }, [page, api_data]);

    useEffect(() => {
        display_data.current = get_display_data(api_data);
        set_page(0);
    }, [selected_area]);

    return (
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
            {/* 按鈕選擇行政區 */}
            <div>
                {area_list.map((area) => 
                    <Button 
                        style={(area === selected_area) ? selected_btn_style : btn_style} 
                        onClick={() => set_selected_area(area)}
                    > 
                        {area} 
                    </Button>
                )}
            </div>

            {/* 資料表格 */}
            <Box sx={{ width: '90%' }}>
                <div style={(display_data.current.length === 0) ? {display: 'inline-block', marginTop: '10px'} : {display: 'none'}}>
                    <CircularProgress style={{color: 'gray'}}/>
                    <div style={{color: 'gray'}}>資料讀取中</div>
                </div>

                <Paper style={(display_data.current.length === 0) ? {display: 'none'} : {display: 'block'}}>
                    <TableContainer>
                        <Table>
                            <TableHead style={{backgroundColor: '#f8f5bc'}}>
                                <TableRow>
                                    {['日期', '行政區', '位置', '地圖', '現有車輛數', '空位數', '更新時間'].map((title) => 
                                        <TableCell align="center" style={{color: '#333'}}> {title} </TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {display_data.current.slice(page * rows_per_page, (page + 1) * rows_per_page).map((row) => (
                                    <TableRow key={row.name}>
                                        <TableCell align="center">{row.infoDate}</TableCell>
                                        <TableCell align="center">{row.sarea}</TableCell>
                                        <TableCell align="center">{row.sna.split('YouBike2.0_')[1]}</TableCell>
                                        <TableCell align="center">
                                            <LocationOn 
                                                onClick={() => goToMap(row.lat, row.lng)}
                                                style={{color: 'gray'}} 
                                            />
                                        </TableCell>
                                        <TableCell align="center">{row.sbi}</TableCell>
                                        <TableCell align="center">{row.bemp}</TableCell>
                                        <TableCell align="center">{row.srcUpdateTime.split(' ')[1]}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        style={{backgroundColor: '#f8f5bc'}}
                        rowsPerPageOptions={[10, 15, 20]}
                        component="div"
                        count={display_data.current.length}
                        rowsPerPage={rows_per_page}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            </Box>
        </div>
    );
}

export default DataTable;