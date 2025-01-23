import React, { useState, useEffect } from 'react';

interface Proforma {
    id: string;
    date: string;
    client: string;
    total: number;
    status: 'pending' | 'approved' | 'rejected';
}

const Proformas: React.FC = () => {
    const [proformas, setProformas] = useState<Proforma[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Replace with actual API call
        const fetchProformas = async () => {
            try {
                setLoading(true);
                // Add your API call here
                // const response = await api.getProformas();
                // setProformas(response.data);
            } catch (error) {
                console.error('Error fetching proformas:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProformas();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Proformas</h1>
            
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="grid gap-4">
                    {proformas.map((proforma) => (
                        <div key={proforma.id} className="border p-4 rounded-lg shadow">
                            <div className="flex justify-between">
                                <span className="font-semibold">Client: {proforma.client}</span>
                                <span>Date: {proforma.date}</span>
                            </div>
                            <div className="mt-2">
                                <span>Total: ${proforma.total}</span>
                                <span className="ml-4">Status: {proforma.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Proformas;