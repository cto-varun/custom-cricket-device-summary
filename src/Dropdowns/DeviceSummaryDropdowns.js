import React, { useState, useEffect } from 'react';
import { Menu, Tooltip, Button, Dropdown } from 'antd';
import Icon from '@ant-design/icons';
import { MessageBus } from '@ivoyant/component-message-bus';
import LinkButton from '@ivoyant/component-link-button';
import { DownOutlined } from '@ant-design/icons';
import globeSVG from './icons/globe.svg';
import invoicesSVG from './icons/invoices.svg';
import smartphoneSVG from './icons/smartphone.svg';

import Modal from '../Modal/ModalComponent';
import './dropdowns.css';
import jsonata from 'jsonata';
import plugin from 'js-plugin';

const { SubMenu } = Menu;

const GlobeIcon = (
    <Icon
        component={() => <img src={globeSVG} />}
        className="device-summary-dropdown-icon globe-icon"
        alt="globe-icon"
    />
);
const InvoiceIcon = (
    <Icon
        component={() => <img src={invoicesSVG} />}
        className="device-summary-dropdown-icon invoices-icon"
        alt="invoices-icon"
    />
);
const SmartPhoneIcon = (
    <Icon
        component={() => <img src={smartphoneSVG} />}
        className="device-summary-dropdown-icon smartphone-icon"
        alt="smartphone-icon"
    />
);

const DeviceSummaryDropdowns = ({
    selectedRows,
    dropdownData,
    modalConfig,
    datasources,
    profilesInfo,
    lineLevelFeatures,
}) => {
    const [modalId, setModalId] = useState(undefined);
    const getFlagInfo = (
        disableExpr,
        disableMsg,
        featureKeys,
        allowedLineStatuses,
        maxSelections = 9
    ) => {
        let disabled = false;
        const disabledArray = [];
        const disabledReasonsArray = [];
        let disabledReason;

        if (selectedRows.length > maxSelections) {
            disabled = true;
            disabledReason =
                'Only ' +
                maxSelections +
                ' line(s) should be selected to enable this activity';
        } else if (disableExpr) {
            disabled = jsonata(disableExpr).evaluate(selectedRows);
            if (disabled) {
                disabledReason =
                    disableMsg ||
                    'Selected operation is not allowed for Device(s) selected';
            }
        }

        if (!disabled) {
            if (featureKeys && featureKeys.length > 0) {
                featureKeys.forEach((featureKey) => {
                    const featureFlag = plugin.invoke(
                        'features.evaluate',
                        featureKey
                    );
                    if (!featureFlag[0]?.enabled) {
                        disabledArray.push(featureFlag[0]);
                        disabledReason = featureFlag[0]?.reasons.toString();
                        disabledReasonsArray.push(disabledReason);
                    }
                });
            }
            if (!disabled && allowedLineStatuses) {
                disabled =
                    selectedRows.filter((sr) =>
                        allowedLineStatuses.includes(
                            sr?.telephoneData?.ptnStatus
                        )
                    ).length != selectedRows.length;
                disabledReason =
                    'Line selected has status not supported for this activity';
            }

            // If not disabled by account featute level checks the linelevel
            if (!disabled) {
                selectedRows.filter(({ telephoneData }) => {
                    lineLevelFeatures?.filter(
                        ({ subscriberNumber, features }) => {
                            if (
                                telephoneData?.subscriberNumber ===
                                subscriberNumber
                            ) {
                                features?.filter(
                                    ({ feature, enable, reasons }) => {
                                        if (
                                            featureKeys?.includes(feature) &&
                                            !enable
                                        ) {
                                            disabledArray.push({
                                                feature: feature,
                                                enable: enable,
                                                enabled: enable,
                                                disabled: !enable,
                                                reasons,
                                            });
                                            disabledReasonsArray.push(
                                                reasons?.toString()
                                            );
                                        }
                                    }
                                );
                            }
                        }
                    );
                });
            }

            disabled =
                disabledArray.length &&
                disabledArray.every((el) => !el?.enabled);
            if (disabled) {
                disabledReason = disabledReasonsArray.toString();
            }
        }

        return { disabled, disabledReason };
    };

    const addFlagInfo = (menuItems) => {
        return menuItems.map((mi) => {
            return {
                ...mi,
                featureFlag: getFlagInfo(
                    mi.disableExpr,
                    mi.disableMsg,
                    mi.featureFlagKeys,
                    mi.allowedLineStatuses,
                    mi.maxSelections
                ),
            };
        });
    };

    const getMenuItem = (type, menuItem, idx) => {
        return menuItem.target && menuItem.target.type === 'link' ? (
            <Menu.Item
                key={type + idx}
                className="device-summary-dropdown-menu-item"
            >
                {menuItem.featureFlag.disabled ? (
                    <Tooltip
                        title={
                            menuItem.featureFlag.disabled
                                ? 'Disabled : ' +
                                  menuItem.featureFlag.disabledReason
                                : null
                        }
                        placement="right"
                    >
                        <Button
                            disabled={menuItem.featureFlag.disabled}
                            type="text"
                            block
                            style={{ textAlign: 'left', paddingLeft: 0 }}
                        >
                            {menuItem.name}
                        </Button>
                    </Tooltip>
                ) : (
                    <LinkButton
                        className="submit-button"
                        size="small"
                        href={menuItem.target.link}
                        routeData={selectedRows}
                        src={menuItem.id}
                        disabled={menuItem.featureFlag.disabled}
                        type="text"
                        block
                        style={{ textAlign: 'left', paddingLeft: 0 }}
                    >
                        <span>{menuItem.name}</span>
                    </LinkButton>
                )}
            </Menu.Item>
        ) : (
            <Menu.Item
                key={type + idx}
                className="device-summary-dropdown-menu-item"
                onClick={() => {
                    if (!menuItem.featureFlag.disabled) {
                        if (menuItem.event) {
                            MessageBus.send(menuItem.event, selectedRows);
                        } else if (modalConfig[menuItem.id])
                            setModalId(menuItem.id);
                    }
                }}
            >
                <Tooltip
                    title={
                        menuItem.featureFlag.disabled
                            ? 'Disabled : ' +
                              menuItem.featureFlag.disabledReason
                            : null
                    }
                    placement="right"
                >
                    <Button
                        disabled={menuItem.featureFlag.disabled}
                        type="text"
                        block
                        style={{ textAlign: 'left', paddingLeft: 0 }}
                    >
                        {menuItem.name}
                    </Button>
                </Tooltip>
            </Menu.Item>
        );
    };

    const getMenuItems = (type, menuItems) => {
        return (
            <>
                <>
                    {menuItems
                        .filter((mi) =>
                            mi?.showForProfiles
                                ? mi.showForProfiles.includes(
                                      window[window.sessionStorage?.tabId]
                                          .COM_IVOYANT_VARS.profile
                                  )
                                : true
                        )
                        .map((menuItem, idx) =>
                            getMenuItem(type, menuItem, idx)
                        )}
                </>

                {modalId && (
                    <Modal
                        config={modalConfig[modalId]}
                        data={selectedRows[0]}
                        datasources={datasources}
                        profilesInfo={profilesInfo}
                    />
                )}
            </>
        );
    };

    const menu = (
        <Menu>
            {getMenuItems(
                'Device',
                addFlagInfo(
                    dropdownData.deviceMenuItems.filter(
                        ({ id }) => id !== 'unlockDevice' && id !== 'changeIMEI'
                    )
                )
            )}
            {getMenuItems(
                'Network',
                addFlagInfo(
                    dropdownData.networkMenuItems.filter(
                        ({ id }) => id !== 'unlockSIM' && id !== 'changeSIM'
                    )
                )
            )}
            {getMenuItems('Plan', addFlagInfo(dropdownData.planMenuItems))}
            {/* <SubMenu
                    key="DeviceMenuItems"
                    title="Device related changes"
                    icon={SmartPhoneIcon}
                >
                    {getMenuItems(
                        'Device',
                        addFlagInfo(dropdownData.deviceMenuItems)
                    )}
                </SubMenu>

                <SubMenu
                    key="NetworkMenuItems"
                    icon={GlobeIcon}
                    title="Network related changes"
                >
                    {getMenuItems(
                        'Network',
                        addFlagInfo(dropdownData.networkMenuItems)
                    )}
                </SubMenu>

                <SubMenu
            key="PlanMenuItems"
            title="Plan related changes"
            icon={InvoiceIcon}
        >
            {getMenuItems(
                'Plan',
                addFlagInfo(dropdownData.planMenuItems)
            )}
        </SubMenu> */}
        </Menu>
    );

    useEffect(() => {
        if (modalId) {
            setTimeout(() => {
                setModalId(undefined);
            }, 750);
        }
    }, [modalId]);

    return (
        <>
            <Dropdown menu={menu}>
                <span
                    className="ant-dropdown-link"
                    onClick={(e) => e.preventDefault()}
                >
                    <Icon
                        component={() => <img src={smartphoneSVG} />}
                        className="device-summary-dropdown-icon smartphone-icon"
                        alt="smartphone-icon"
                    />
                    More Changes <DownOutlined />
                </span>
            </Dropdown>
        </>
    );
};

export default DeviceSummaryDropdowns;
