CREATE OR REPLACE FUNCTION get_flashcard_sets_for_user(
    p_user_id UUID,
    p_page INT,
    p_limit INT,
    p_sort_by TEXT,
    p_sort_order TEXT,
    p_status TEXT,
    p_name_search TEXT,
    p_view TEXT
)
RETURNS TABLE (
    id UUID,
    owner_id UUID,
    name TEXT,
    status TEXT,
    description TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    flashcard_count INT,
    access_level TEXT,
    owner_email TEXT,
    total_count BIGINT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_offset INT;
    v_sort_column TEXT;
BEGIN
    v_offset := (p_page - 1) * p_limit;
    v_sort_column := CASE p_sort_by
        WHEN 'name' THEN 'name'
        WHEN 'createdAt' THEN 'created_at'
        WHEN 'updatedAt' THEN 'updated_at'
        ELSE 'created_at'
    END;
    RETURN QUERY
    WITH all_sets AS (
        -- Zestawy własne użytkownika
        SELECT
            fs.id, fs.owner_id, fs.name, fs.status, fs.description, fs.created_at, fs.updated_at,
            (SELECT count(*) FROM flashcards WHERE flashcards_set_id = fs.id)::INT AS flashcard_count,
            'owner' AS access_level,
            NULL::TEXT AS owner_email
        FROM flashcards_set fs
        WHERE fs.owner_id = p_user_id AND (p_view = 'all' OR p_view = 'owned')
        UNION ALL
        -- Zestawy udostępnione użytkownikowi
        SELECT
            fs.id, fs.owner_id, fs.name, fs.status, fs.description, fs.created_at, fs.updated_at,
            (SELECT count(*) FROM flashcards WHERE flashcards_set_id = fs.id)::INT,
            'viewer' AS access_level,
            u.email AS owner_email
        FROM flashcards_set_shares s
        JOIN flashcards_set fs ON s.flashcards_set_id = fs.id
        JOIN auth.users u ON fs.owner_id = u.id
        WHERE s.user_id = p_user_id AND (s.expires_at IS NULL OR s.expires_at > now())
          AND (p_view = 'all' OR p_view = 'shared')
    ),
    filtered_sets AS (
        SELECT * FROM all_sets
        WHERE
            (p_status IS NULL OR all_sets.status::TEXT = p_status) AND
            (p_name_search IS NULL OR all_sets.name ILIKE '%' || p_name_search || '%')
    ),
    counted_sets AS (
        SELECT *, COUNT(*) OVER() as total_count FROM filtered_sets
    )
    SELECT cs.id, cs.owner_id, cs.name::text, cs.status::TEXT, cs.description::text, cs.created_at, cs.updated_at,
           cs.flashcard_count, cs.access_level, cs.owner_email, cs.total_count
    FROM counted_sets cs
    ORDER BY
        CASE WHEN v_sort_column = 'name' AND p_sort_order = 'asc' THEN cs.name END ASC,
        CASE WHEN v_sort_column = 'name' AND p_sort_order = 'desc' THEN cs.name END DESC,
        CASE WHEN v_sort_column = 'createdAt' AND p_sort_order = 'asc' THEN cs.created_at END ASC,
        CASE WHEN v_sort_column = 'createdAt' AND p_sort_order = 'desc' THEN cs.created_at END DESC,
        CASE WHEN v_sort_column = 'updatedAt' AND p_sort_order = 'asc' THEN cs.updated_at END ASC,
        CASE WHEN v_sort_column = 'updatedAt' AND p_sort_order = 'desc' THEN cs.updated_at END DESC
    LIMIT p_limit
    OFFSET v_offset;
END;
$$; 