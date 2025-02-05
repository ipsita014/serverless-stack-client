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

    const BASE_URL = "https://note-app-uploads-ipsita.s3.us-east-1.amazonaws.com";

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
            <div className="notes-grid">
                <LinkContainer to="/notes/new">
                    <div className="note-card create-new-card">
                        <BsPencilSquare size={30} />
                        <h5>Create a new note</h5>
                    </div>
                </LinkContainer>
                {notes.map(({ noteId, content, createdAt, attachment, userId }) => {
                    const safeContent = typeof content === "string" ? content : "No content available";
                    const safeAttachment = typeof attachment === "string" ? attachment : null;

                    const filePath = `private/${userId}/${safeAttachment}`;
                    const encodedKey = encodeURIComponent(filePath);
                    const imageUrl = `${BASE_URL}/${encodedKey}`;

                    return (
                        <LinkContainer key={noteId} to={`/notes/${noteId}`}>
                            <div className="note-card">
                                {imageUrl && (
                                    <img
                                        src={imageUrl}
                                        alt={`Note ${safeContent.trim().split("\n")[0]}`}
                                        className="note-image"
                                        onError={(e) => (e.target.src = "/default-image.png")}
                                    />
                                )}
                                <div className="note-content">
                                    <span className="font-weight-bold">
                                        {safeContent.trim().split("\n")[0]}
                                    </span>
                                </div>
                                <div className="note-actions">
                                    <Button variant="primary" size="sm" className="mr-2">
                                        Show
                                    </Button>
                                </div>
                                <div className="card-body">
                                    <h5 className="card-title">
                                        {content.trim().split("\n")[0]}
                                    </h5>
                                    <p className="card-text">
                                        Created: {new Date(createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </LinkContainer>
                    );
                })}
            </div>
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
      <div className="greet-container">
        <h2>Welcome, <span>{greet}</span></h2>
      </div>
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