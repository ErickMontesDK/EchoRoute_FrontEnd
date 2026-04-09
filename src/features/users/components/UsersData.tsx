import Layout from "../../../components/Layout";
import { useState } from "react";
import { User, useRestoreUser } from "../hooks/useUsers";
import { useUsers } from "../hooks/useUsers";
import Select from "../../../components/common/inputs/Select";
import Searchbar from "../../../components/common/inputs/Searchbar";
import TableDisplay from "../../../components/TableDisplay";
import { columns } from "./columns";
import { Plus, Users, ListFilter } from "lucide-react";
import "./users-data.css";

import CreateUserModal from "./modals/CreateUserModal";
import EditUserModal from "./modals/EditUserModal";
import DeleteUserModal from "./modals/DeleteUserModal";
import ChangePasswordModal from "./modals/ChangePasswordModal";

export const userRoles = [
    { id: "ADMIN", name: "Admin" },
    { id: "DELIVERY", name: "Delivery" },
    { id: "OPERATOR", name: "Operator" },
];

export default function UsersData() {
    const current_role = localStorage.getItem("role") || "";
    const isAdmin = current_role.toLowerCase() === "admin";

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {
        users,
        totalPages,
        pagination,
        setPagination,
        filters,
        updateFilters,
        sorting,
        setSorting,
        refresh
    } = useUsers();

    const { restoreUser } = useRestoreUser(selectedUser, setSelectedUser, refresh, (msg) => setErrorMessage(msg));

    return (
        <Layout>
            <main className="animate-fade-in">
                <header>
                    <h1><Users size={34} className="flex-shrink-0 me-2 text-primary mb-1" />Users Data</h1>
                </header>
                <section className="filters-card p-4 mb-4 shadow-sm border rounded bg-white">

                    {errorMessage && (
                        <div className="alert alert-danger py-2 mb-3" role="alert">
                            {errorMessage}
                        </div>
                    )}


                    <h5 className="mb-3 text-secondary">
                        <ListFilter size={20} className="flex-shrink-0 me-2 text-primary mb-1" />Filters
                    </h5>

                    <div className="row g-3 mb-4 align-items-end">
                        <div className="col-md-2">
                            <Select
                                name="role"
                                id="role"
                                value={filters.role}
                                onChange={(e) => updateFilters("role", e.target.value)}
                                options={userRoles}
                                placeholder="All"
                                label="Role"
                            />
                        </div>
                        <div className="col-md-4">
                            <Searchbar
                                name="search"
                                id="search"
                                value={filters.search_term}
                                onChange={(e) => updateFilters("search_term", e.target.value)}
                                placeholder="Search by name, username, email..."
                                label="Search Term"
                            />
                        </div>

                        {isAdmin && (
                            <div className="col-md-3 d-flex align-items-end">
                                <div className="form-check form-switch p-2 border rounded w-100 bg-light d-flex align-items-center filter-switch-container">
                                    <input
                                        className="form-check-input ms-2 me-2"
                                        type="checkbox"
                                        role="switch"
                                        id="show_deleted_users"
                                        checked={filters.is_deleted}
                                        onChange={(e) => updateFilters("is_deleted", e.target.checked)}
                                    />
                                    <label className="form-check-label mb-0" htmlFor="show_deleted_users">Show Deleted</label>
                                </div>
                            </div>
                        )}

                        <div className="col-md-3">
                            <button
                                className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 create-user-btn"
                                onClick={() => {
                                    setErrorMessage(null);
                                    setShowCreateModal(true);
                                }}
                            >
                                <Plus size={20} />
                                Create User
                            </button>
                        </div>

                    </div>
                </section>

                <TableDisplay
                    columns={columns}
                    data={users}
                    pageCount={totalPages}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    sorting={sorting}
                    onSortingChange={setSorting}
                    editEnabled={true}
                    onEdit={(user) => {
                        setErrorMessage(null);
                        setSelectedUser(user);
                        setShowEditModal(true);
                    }}
                    onDelete={(user) => {
                        setErrorMessage(null);
                        setSelectedUser(user);
                        setShowDeleteModal(true);
                    }}
                    onRestore={(user) => {
                        setErrorMessage(null);
                        setSelectedUser(user);
                        restoreUser(user);
                    }}
                    onChangePassword={(user) => {
                        setErrorMessage(null);
                        setSelectedUser(user);
                        setShowPasswordModal(true);
                    }}
                    isUserTable={true}
                />

            </main>

            <CreateUserModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={refresh}
                key={`create-${showCreateModal}`}
            />

            <EditUserModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSuccess={refresh}
                user={selectedUser}
                key={`edit-${selectedUser?.id ?? 'closed'}-${showEditModal}`}
            />

            <DeleteUserModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onSuccess={refresh}
                user={selectedUser}
                key={`delete-${selectedUser?.id ?? 'closed'}-${showDeleteModal}`}
            />

            <ChangePasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onSuccess={refresh}
                user={selectedUser}
                key={`password-${selectedUser?.id ?? 'closed'}-${showPasswordModal}`}
            />

        </Layout>
    );
}