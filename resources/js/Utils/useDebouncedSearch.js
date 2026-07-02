import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function useDebouncedSearch(routeName, initialSearch = '', delay = 350) {
    const [search, setSearch] = useState(initialSearch || '');
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                route(routeName),
                { search },
                {
                    preserveState: true,
                    replace: true,
                },
            );
        }, delay);

        return () => clearTimeout(timeout);
    }, [delay, routeName, search]);

    return [search, setSearch];
}
