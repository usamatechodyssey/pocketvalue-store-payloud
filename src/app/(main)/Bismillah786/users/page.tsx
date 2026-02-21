// src/app/Bismillah786/users/page.tsx

import { getPaginatedUsers } from "./_actions/userActions";
import UsersClientPage from "./_components/UsersClientPage";
import UsersLoadingSkeleton from "./_components/LoadingSkeleton";
import { Suspense } from 'react';

type AdminUsersPageProps = {
    searchParams: Promise<{ page?: string; search?: string; }>;
}

async function UsersList(props: AdminUsersPageProps) {
    const searchParams = await props.searchParams;
    const page = Number(searchParams.page) || 1;
    const searchTerm = searchParams.search || '';
    
    const { users, totalPages } = await getPaginatedUsers({ page, searchTerm });

    return <UsersClientPage initialUsers={users} initialTotalPages={totalPages} />;
}

export default async function AdminUsersPage(props: AdminUsersPageProps) {
    const searchParams = await props.searchParams;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                Manage Customers
            </h1>
            <Suspense 
                key={`${searchParams.page}-${searchParams.search}`}
                fallback={<UsersLoadingSkeleton />}
            >
                <UsersList searchParams={props.searchParams} />
            </Suspense>
        </div>
    );
}