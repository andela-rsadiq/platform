// Copyright (c) 2016 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import UserList from 'components/user_list.jsx';

import * as Utils from 'utils/utils.jsx';
import Constants from 'utils/constants.jsx';
const KeyCodes = Constants.KeyCodes;

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';

const NEXT_BUTTON_TIMEOUT = 500;

export default class SearchableUserList extends React.Component {
    constructor(props) {
        super(props);

        this.nextPage = this.nextPage.bind(this);
        this.previousPage = this.previousPage.bind(this);
        this.doSearch = this.doSearch.bind(this);
        this.onSearchBoxKeyPress = this.onSearchBoxKeyPress.bind(this);
        this.onSearchBoxChange = this.onSearchBoxChange.bind(this);

        this.nextTimeoutId = 0;

        this.state = {
            page: 0,
            search: false,
            nextDisabled: false
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.page !== prevState.page) {
            $(ReactDOM.findDOMNode(this.refs.userList)).scrollTop(0);
        }
    }

    componentWillUnmount() {
        clearTimeout(this.nextTimeoutId);
    }

    nextPage(e) {
        e.preventDefault();
        this.setState({page: this.state.page + 1, nextDisabled: true});
        this.nextTimeoutId = setTimeout(() => this.setState({nextDisabled: false}), NEXT_BUTTON_TIMEOUT);
        this.props.nextPage(this.state.page + 1);
    }

    previousPage(e) {
        e.preventDefault();
        this.setState({page: this.state.page - 1});
    }

    doSearch() {
        const term = this.refs.filter.value;
        this.props.search(term);
        if (term === '') {
            this.setState({page: 0, search: false});
        } else {
            this.setState({search: true});
        }
    }

    onSearchBoxKeyPress(e) {
        if (e.charCode === KeyCodes.ENTER) {
            e.preventDefault();
            this.doSearch();
        }
    }

    onSearchBoxChange(e) {
        if (e.target.value === '') {
            this.props.search(''); // clear search
            this.setState({page: 0, search: false});
        }
    }

    render() {
        let nextButton;
        let previousButton;
        let usersToDisplay;

        if (this.state.search) {
            usersToDisplay = this.props.users;
        } else {
            const pageStart = this.state.page * this.props.usersPerPage;
            const pageEnd = pageStart + this.props.usersPerPage;
            usersToDisplay = this.props.users.slice(pageStart, pageEnd);

            if (usersToDisplay.length >= this.props.usersPerPage) {
                nextButton = (
                    <button
                        className='btn btn-default filter-control filter-control__next'
                        onClick={this.nextPage}
                        disabled={this.state.nextDisabled}
                    >
                        {'Next'}
                    </button>
                );
            }

            if (this.state.page > 0) {
                previousButton = (
                    <button
                        className='btn btn-default filter-control filter-control__prev'
                        onClick={this.previousPage}
                    >
                        {'Previous'}
                    </button>
                );
            }
        }

        let count;
        if (this.props.total) {
            if (this.state.search) {
                count = (
                    <FormattedMessage
                        id='filtered_user_list.countTotal'
                        defaultMessage='{count} {count, plural, =0 {0 members} one {member} other {members}} of {total} total'
                        values={{
                            count: usersToDisplay.length,
                            total: this.props.total
                        }}
                    />
                );
            } else {
                const startCount = this.state.page * this.props.usersPerPage;
                const endCount = startCount + usersToDisplay.length;

                count = (
                    <FormattedMessage
                        id='filtered_user_list.countTotalPage'
                        defaultMessage='{startCount, number} - {endCount, number} {count, plural, =0 {0 members} one {member} other {members}} of {total} total'
                        values={{
                            count: usersToDisplay.length,
                            startCount: startCount + 1,
                            endCount,
                            total: this.props.total
                        }}
                    />
                );
            }
        }

        return (
            <div
                className='filtered-user-list'
                style={this.props.style}
            >
                <div className='filter-row'>
                    <div className='col-sm-5'>
                        <input
                            ref='filter'
                            className='form-control filter-textbox'
                            placeholder={Utils.localizeMessage('filtered_user_list.search', 'Press enter to search')}
                            onKeyPress={this.onSearchBoxKeyPress}
                            onChange={this.onSearchBoxChange}
                        />
                    </div>
                    <div className='col-sm-2 filter-button'>
                        <button
                            type='button'
                            className='btn btn-primary'
                            onClick={this.doSearch}
                        >
                            <FormattedMessage
                                id='filtered_user_list.searchButton'
                                defaultMessage='Search'
                            />
                        </button>
                    </div>
                    <div className='col-sm-12'>
                        <span className='member-count pull-left'>{count}</span>
                    </div>
                </div>
                <div
                    ref='userList'
                    className='more-modal__list'
                >
                    <UserList
                        users={usersToDisplay}
                        extraInfo={this.props.extraInfo}
                        actions={this.props.actions}
                        actionProps={this.props.actionProps}
                        actionUserProps={this.props.actionUserProps}
                    />
                </div>
                <div className='filter-controls'>
                    {previousButton}
                    {nextButton}
                </div>
            </div>
        );
    }
}

SearchableUserList.defaultProps = {
    users: [],
    usersPerPage: 50, //eslint-disable-line no-magic-numbers
    extraInfo: {},
    actions: [],
    actionProps: {},
    actionUserProps: {},
    showTeamToggle: false
};

SearchableUserList.propTypes = {
    users: React.PropTypes.arrayOf(React.PropTypes.object),
    usersPerPage: React.PropTypes.number,
    total: React.PropTypes.number,
    extraInfo: React.PropTypes.object,
    nextPage: React.PropTypes.func.isRequired,
    search: React.PropTypes.func.isRequired,
    actions: React.PropTypes.arrayOf(React.PropTypes.func),
    actionProps: React.PropTypes.object,
    actionUserProps: React.PropTypes.object,
    style: React.PropTypes.object
};
