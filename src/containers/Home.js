import React, { useState, useEffect } from "react";
import { useAppContext } from "../libs/contextLib";
import { onError } from "../libs/errorLib";
import { Auth } from "aws-amplify";
import { BsPencilSquare } from "react-icons/bs";
import { LinkContainer } from "react-router-bootstrap";
import { API } from "aws-amplify";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Pagination from "react-bootstrap/Pagination";
import Card from "react-bootstrap/Card"; // Importing Card
import "./Home.css";

const NOTES_PER_PAGE = 5;

export default function Home() {
    const [notes, setNotes] = useState([]);
    const [filteredNotes, setFilteredNotes] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [greet, setGreet] = useState();
    const { isAuthenticated } = useAppContext();
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        async function onLoad() {
            if (!isAuthenticated) {
                return;
            }
            try {
                const notes = await loadNotes();
                const user = await Auth.currentAuthenticatedUser();
                const { attributes } = user;
                setGreet(attributes.email);
                setNotes(notes);
                setFilteredNotes(notes);
            } catch (e) {
                onError(e);
            }
            setIsLoading(false);
        }
        onLoad();
    }, [isAuthenticated]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filteredNotes]);

    async function loadNotes() {
        return await API.get("notes", "/notes");
    }

    function handleSearch(event) {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);
        setFilteredNotes(
            notes.filter(
                (note) =>
                    note.content.toLowerCase().includes(term) ||
                    (note.attachment && note.attachment.toLowerCase().includes(term))
            )
        );
    }

    function handlePageChange(pageNumber) {
        setCurrentPage(pageNumber);
    }

    const indexOfLastNote = currentPage * NOTES_PER_PAGE;
    const indexOfFirstNote = indexOfLastNote - NOTES_PER_PAGE;
    const currentNotes = filteredNotes.slice(indexOfFirstNote, indexOfLastNote);

    function renderNotesList(notes) {
        return (
            <>
                <LinkContainer to="/notes/new">
                    <Card className="create-note-card">
                        <Card.Body className="text-center">
                            <BsPencilSquare size={17} />
                            <span className="ml-2 font-weight-bold">Create a new note</span>
                        </Card.Body>
                    </Card>
                </LinkContainer>
                {notes.map(({ noteId, content, createdAt, attachment }) => (
                    <LinkContainer key={noteId} to={`/notes/${noteId}`}>
                        <Card className="note-card mb-3">
                            <Card.Body>
                                <div>
                                    <span className="font-weight-bold">
                                        {content.trim().split("\n")[0]}
                                    </span>
                                    <br />
                                    <span className="text-muted">
                                        Created: {new Date(createdAt).toLocaleString()}
                                    </span>
                                </div>
                            </Card.Body>
                        </Card>
                    </LinkContainer>
                ))}
            </>
        );
    }

    function renderPagination() {
        const totalPages = Math.ceil(filteredNotes.length / NOTES_PER_PAGE);
        const paginationItems = [];
        for (let number = 1; number <= totalPages; number++) {
            paginationItems.push(
                <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => handlePageChange(number)}
                >
                    {number}
                </Pagination.Item>
            );
        }
        return <Pagination>{paginationItems}</Pagination>;
    }

    function renderLander() {
        return (
            <div className="lander">
                <h1>Scratch</h1>
                <p className="text-muted">A simple note-taking app</p>
                <div className="box">
                    <LinkContainer to="/signup">
                        <Button variant="success">Sign up</Button>
                    </LinkContainer>
                    <LinkContainer to="/login">
                        <Button className="ml-4" variant="primary">Login</Button>
                    </LinkContainer>
                </div>
            </div>
        );
    }

    function renderNotes() {
        return (
            <div className="notes">
                <h2>
                    Welcome, <span>{greet}</span>
                </h2>
                <h2 className="pb-3 mt-4 mb-3 border-bottom">Your Notes</h2>
                <Form className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Search notes..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </Form>
                {!isLoading ? (
                    <>
                        <div className="note-cards-list">
                            {renderNotesList(currentNotes)}
                        </div>
                        {renderPagination()}
                    </>
                ) : (
                    <p>Loading notes...</p>
                )}
            </div>
        );
    }

    return <div className="Home">{isAuthenticated ? renderNotes() : renderLander()}</div>;
}
