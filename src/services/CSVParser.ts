// CSV Parser Service for Bank Statement Import

export interface CSVColumn {
    index: number;
    name: string;
    sample: string;
}

export interface CSVMapping {
    date?: number;
    description?: number;
    amount?: number;
    type?: number;
    category?: number;
}

export interface ParsedTransaction {
    date: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category?: string;
}

export const CSVParser = {
    /**
     * Parse CSV file and detect columns
     */
    async parseFile(file: File): Promise<{ columns: CSVColumn[]; rows: string[][] }> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const text = e.target?.result as string;
                    const lines = text.split('\n').filter(line => line.trim());

                    if (lines.length === 0) {
                        throw new Error('Arquivo vazio');
                    }

                    // Parse CSV (simple implementation, handles basic cases)
                    const rows = lines.map(line => {
                        // Handle quoted fields
                        const regex = /(?:,|^)("(?:[^"]|"")*"|[^,]*)/g;
                        const fields: string[] = [];
                        let match;

                        while ((match = regex.exec(line)) !== null) {
                            let field = match[1];
                            // Remove quotes and unescape
                            if (field.startsWith('"') && field.endsWith('"')) {
                                field = field.slice(1, -1).replace(/""/g, '"');
                            }
                            fields.push(field.trim());
                        }

                        return fields;
                    });

                    // Detect columns from header
                    const header = rows[0];
                    const sampleRow = rows[1] || [];

                    const columns: CSVColumn[] = header.map((name, index) => ({
                        index,
                        name,
                        sample: sampleRow[index] || ''
                    }));

                    resolve({ columns, rows: rows.slice(1) });
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
            reader.readAsText(file, 'UTF-8');
        });
    },

    /**
     * Auto-detect column mapping based on content
     */
    autoDetectMapping(columns: CSVColumn[]): CSVMapping {
        const mapping: CSVMapping = {};

        columns.forEach(col => {
            const nameLower = col.name.toLowerCase();
            const sample = col.sample.toLowerCase();

            // Date detection
            if (
                nameLower.includes('data') ||
                nameLower.includes('date') ||
                /\d{2}\/\d{2}\/\d{4}/.test(col.sample)
            ) {
                mapping.date = col.index;
            }

            // Description detection
            if (
                nameLower.includes('descri') ||
                nameLower.includes('histórico') ||
                nameLower.includes('historico') ||
                nameLower.includes('description')
            ) {
                mapping.description = col.index;
            }

            // Amount detection
            if (
                nameLower.includes('valor') ||
                nameLower.includes('amount') ||
                nameLower.includes('value') ||
                /[\d.,]+/.test(col.sample)
            ) {
                mapping.amount = col.index;
            }

            // Type detection
            if (
                nameLower.includes('tipo') ||
                nameLower.includes('type') ||
                nameLower.includes('natureza')
            ) {
                mapping.type = col.index;
            }

            // Category detection
            if (
                nameLower.includes('categoria') ||
                nameLower.includes('category')
            ) {
                mapping.category = col.index;
            }
        });

        return mapping;
    },

    /**
     * Convert rows to transactions using mapping
     */
    rowsToTransactions(
        rows: string[][],
        mapping: CSVMapping
    ): ParsedTransaction[] {
        return rows
            .filter(row => row.length > 0 && row.some(cell => cell.trim()))
            .map(row => {
                const date = mapping.date !== undefined ? this.parseDate(row[mapping.date]) : new Date().toISOString();
                const description = mapping.description !== undefined ? row[mapping.description] : 'Transação';
                const amountStr = mapping.amount !== undefined ? row[mapping.amount] : '0';
                const typeStr = mapping.type !== undefined ? row[mapping.type]?.toLowerCase() : '';
                const category = mapping.category !== undefined ? row[mapping.category] : undefined;

                // Parse amount
                const amount = this.parseAmount(amountStr);

                // Detect type
                let type: 'income' | 'expense' = 'expense';
                if (typeStr.includes('credit') || typeStr.includes('entrada') || typeStr.includes('receita') || amount > 0) {
                    type = 'income';
                }

                return {
                    date,
                    description: description.trim(),
                    amount: Math.abs(amount),
                    type,
                    category
                };
            })
            .filter(t => t.amount > 0); // Filter out zero amounts
    },

    /**
     * Parse date from various formats
     */
    parseDate(dateStr: string): string {
        if (!dateStr) return new Date().toISOString();

        // Try DD/MM/YYYY
        const ddmmyyyy = /(\d{2})\/(\d{2})\/(\d{4})/.exec(dateStr);
        if (ddmmyyyy) {
            const [, day, month, year] = ddmmyyyy;
            return new Date(`${year}-${month}-${day}`).toISOString();
        }

        // Try YYYY-MM-DD
        const yyyymmdd = /(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
        if (yyyymmdd) {
            return new Date(dateStr).toISOString();
        }

        // Fallback
        return new Date().toISOString();
    },

    /**
     * Parse amount from string
     */
    parseAmount(amountStr: string): number {
        if (!amountStr) return 0;

        // Remove currency symbols and spaces
        let cleaned = amountStr.replace(/[R$\s]/g, '');

        // Handle Brazilian format (1.234,56)
        if (cleaned.includes('.') && cleaned.includes(',')) {
            cleaned = cleaned.replace(/\./g, '').replace(',', '.');
        }
        // Handle only comma (123,45)
        else if (cleaned.includes(',')) {
            cleaned = cleaned.replace(',', '.');
        }

        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
    }
};
