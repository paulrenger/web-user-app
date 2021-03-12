import React, { useState } from 'react';
import { Dropdown, Button as AntdButton, Menu, Row, Col } from 'antd';
import {
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import Icons from '../../assets/icons';
import classes from './SortParticipant.module.scss';

interface SortParticipantProps {
  setParticipantList: (val: object[]) => void;
  getParticipantList: object[];
}

const SortParticipant: React.FC<SortParticipantProps> = React.memo(
  ({ setParticipantList, getParticipantList }) => {
    const [orderBool, setOrderBool] = useState(true);
    const [icon, setIcon] = useState(<SortAscendingOutlined />);

    const compareValues = (key, order = 'asc') =>
      function innerSort(a, b) {
        if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
          // property doesn't exist on either object
          return 0;
        }

        const varA = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
        const varB = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];
        let comparison = 0;
        if (varA > varB) {
          comparison = 1;
        } else if (varA < varB) {
          comparison = -1;
        }
        return order === 'desc' ? comparison * -1 : comparison;
      };

    const sort = (key) => {
      setOrderBool(!orderBool);
      let sortParticipants = [...getParticipantList];
      sortParticipants.sort(compareValues(key, orderBool ? 'asc' : 'desc'));
      setParticipantList(sortParticipants);
    };

    const menu = (
      <Menu>
        <Menu.Item>
          <a target="_blank" onClick={() => sort('firstname')}>
            Vorname
          </a>
        </Menu.Item>
        <Menu.Item>
          <a target="_blank" onClick={() => sort('lastname')}>
            Nachname
          </a>
        </Menu.Item>
        <Menu.Item>
          <a target="_blank" onClick={() => sort('grade')}>
            Note
          </a>
        </Menu.Item>
      </Menu>
    );

    return (
      //   <Dropdown overlay={menu} placement="bottomLeft" arrow>
      //   <Button style={{width: '100%'}}>Teilnehmer sortieren <SortAscendingOutlined /></Button>
      // </Dropdown>
      <>
        <div className={classes.sortParticipant}>
          <ul>
            <li>
              <p style={{ paddingTop: '5px' }}>Sortieren:</p>
            </li>
            <li>
              <AntdButton onClick={() => sort('firstname')}>
                Vorname
                <Icons.SortSolid
                  style={{ marginLeft: '5px', height: '12px' }}
                />
              </AntdButton>
            </li>
            <li>
              <AntdButton onClick={() => sort('lastname')}>
                Nachname
                <Icons.SortSolid
                  style={{ marginLeft: '5px', height: '12px' }}
                />
              </AntdButton>
            </li>
            <li>
              <AntdButton onClick={() => sort('email')}>
                E-Mail-Addresse
                <Icons.SortSolid
                  style={{ marginLeft: '5px', height: '12px' }}
                />
              </AntdButton>
            </li>
            <li>
              <AntdButton onClick={() => sort('grade')}>
                Note
                <Icons.SortSolid
                  style={{ marginLeft: '5px', height: '12px' }}
                />
              </AntdButton>
              <li>
                <AntdButton onClick={() => sort('schooltype')}>
                  Schultyp
                  <Icons.SortSolid
                    style={{ marginLeft: '5px', height: '12px' }}
                  />
                </AntdButton>
              </li>
            </li>
          </ul>
        </div>
      </>
    );
  }
);

export default SortParticipant;
